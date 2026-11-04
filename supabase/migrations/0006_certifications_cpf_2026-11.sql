-- Correction du 04/11/2026 : codes RS actifs ICDL/LILATE (source : façade Formatrix), fin des promesses CPF sur fiches non certifiantes.
-- Déjà appliquée en production via execute_sql ; conservée pour traçabilité. Les sections RS6452/7344/7013/6910 ont été réécrites à la main (voir rapport).
begin;
set local session_replication_role = replica;
with map(fslug, sslug) as (values
 ('creer-et-administrer-son-site','edition-de-site-web-avec-wordpress'),
 ('l-allemand-des-affaires','formation-l-allemand-des-affaires'),
 ('l-anglais-des-affaires','formation-l-anglais-des-affaires'),
 ('l-espagnol-des-affaires','formation-l-espagnol-des-affaires'),
 ('l-italien-des-affaires','formation-l-italien-des-affaires'),
 ('le-japonais-des-affaires','formation-le-japonais-des-affaires'),
 ('le-mandarin-des-affaires','formation-le-mandarin-des-affaires'),
 ('maitriser-l-art-des-tableurs','formation-maitriser-l-art-des-tableurs'),
 ('maitriser-les-logiciels-de-presentation-pao-powerpoint','formation-maitriser-les-logiciels-de-presentation-pao-powerpoint'),
 ('outils-collaboratifs','formation-outils-collaboratifs'),
 ('traitement-de-texte-de-l-initiation-au-perfectionnement','formation-traitement-de-texte-de-l-initiation-au-perfectionnement')),
src as (
 select m.fslug,
  (select e->>'contenu' from jsonb_array_elements(s.extra_sections::jsonb) e where e->>'rubrique'='Certification') cert,
  (select e->>'contenu' from jsonb_array_elements(s.extra_sections::jsonb) e where e->>'rubrique'='Comment se déroule la certification ?') deroul
 from map m join programs s on s.slug=m.sslug join organizations so on so.id=s.org_id and so.slug='skills4mation'),
f as (
 select p.id, src.cert, src.deroul,
  (regexp_match(src.cert,E'Intitulé exact\n(.*)\nN° d.enregistrement au Répertoire spécifique\n(RS[0-9]+)\n.*\nValidité jusqu.au\n([0-9/]+)'))  m
 from programs p join organizations o on o.id=p.org_id and o.slug='back-to-business-formatrix' join src on src.fslug=p.slug)
update programs p set extra_sections = (
  select jsonb_agg(x.e order by x.k)
  from (
   select e, 
     case when e->>'rubrique'='Encart inscription' then 50 else ord end as k
   from (
     select case when e->>'rubrique'='Encart inscription' then
        jsonb_build_object('rubrique','Encart inscription','contenu',
          E'- Une expérience d’apprentissage optimale pour favoriser votre montée en compétence\n- Une formation adaptée à votre niveau après une évaluation\n- Préparation à la certification « '||f.m[1]||E' » (Répertoire spécifique, '||f.m[2]||', valable jusqu’au '||f.m[3]||E'), éligible au CPF selon les conditions en vigueur\n- Autres financements possibles selon votre situation : OPCO, AGEFICE, FIFPL'
          ||coalesce(E'\n'||(regexp_match(e->>'contenu',E'\n([0-9.]+)\\s*$'))[1],''))
       else e end as e, ord
     from jsonb_array_elements(p.extra_sections::jsonb) with ordinality t(e,ord)
     where e->>'rubrique' not in ('Passage de la certification','Certification','Informations relatives à la certification')
   ) y
   union all select jsonb_build_object('rubrique','Certification','contenu',f.cert), 40
   union all select jsonb_build_object('rubrique','Comment se déroule la certification ?','contenu',f.deroul), 41
  ) x)
from f where f.id=p.id;
-- résultats attendus : anciens libellés
update programs set results_expected = replace(results_expected,'La certification ICDL – Logiciel de Présentation- RS6564- date d’enregistrement 27-03-2024 valide','La certification ICDL – Créer des présentations visuelles et animées avec un logiciel de PréAO (RS7524, enregistrée le 27/02/2026, valable jusqu’au 27/02/2029) valide')
 where slug in ('maitriser-les-logiciels-de-presentation-pao-powerpoint','formation-maitriser-les-logiciels-de-presentation-pao-powerpoint');
update programs set results_expected = replace(results_expected,'“Traitement de traitement texte – RS6559”','“ICDL – Rédiger, structurer et présenter des documents professionnels avec un logiciel de traitement de texte” (RS7529, enregistrée le 27/02/2026, valable jusqu’au 27/02/2029)')
 where slug='traitement-de-texte-de-l-initiation-au-perfectionnement';
-- VTest retiré (seules LILATE et ICDL conservées)
update programs set
 key_points = replace(replace(key_points::text,'LILATE ou VTest','LILATE'),'; éligible au CPF selon les conditions en vigueur pour LILATE','; éligible au CPF selon les conditions en vigueur')::jsonb,
 meta_description = replace(meta_description,'LILATE ou VTest','LILATE'),
 summary = replace(summary,'LILATE ou VTest','LILATE')
 where slug='l-anglais-des-affaires';
commit;

begin;
set local session_replication_role = replica;
-- Fiches non certifiantes : plus de promesse CPF (texte aligné sur la façade Formatrix)
update programs p set extra_sections = (
 select jsonb_agg(case when e->>'rubrique'='Encart inscription' then
   jsonb_build_object('rubrique','Encart inscription','contenu',
    E'- Une expérience d’apprentissage optimale pour favoriser votre montée en compétence\n- Une formation adaptée à votre niveau après une évaluation\n- Financements possibles selon votre situation : plan de développement des compétences (OPCO de la branche), AGEFICE, FIF-PL, AIF France Travail\n- Cette formation n’est pas certifiante : elle n’est pas éligible au CPF.'
    || coalesce(E'\n'||(regexp_match(e->>'contenu',E'\n([0-9.]+)\\s*$'))[1],''))
   else e end order by ord)
 from jsonb_array_elements(p.extra_sections::jsonb) with ordinality t(e,ord))
where p.status='published' and (p.certification is null or p.certification='')
 and p.extra_sections::text ~ '(Compte formation|compte formation)'
 and p.org_id in (select id from organizations where slug in ('back-to-business-formatrix','formavente'));
-- Certifications hors périmètre (RS6452, RS7344, RS7013, RS6910) retirées ; prix sans « éligible CPF »
update programs set price_text = 'À partir de 2 490 € - Financement possible' where slug='vente-b2b-developper-ses-competences-commerciales';
commit;
