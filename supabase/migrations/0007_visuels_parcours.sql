-- Visuels des fiches : une photo détourée (fond blanc) par parcours, générée avec Gemini d'après data/visuels/brief.json.
-- Idempotente : ne remplace que l'image générique de marque (null ou /visuels/og-*), jamais une image choisie par l'organisme.
begin;
set local session_replication_role = replica;
with map(slug, url) as (values
 ('comptabilite-generale','/visuels/parcours-formacompta-comptabilite-generale.webp'),
 ('fiscalite-d-entreprise','/visuels/parcours-formacompta-fiscalite-d-entreprise.webp'),
 ('audit-interne','/visuels/parcours-formacompta-audit-interne.webp'),
 ('normes-ifrs','/visuels/parcours-formacompta-normes-ifrs.webp'),
 ('paie-et-droit-social','/visuels/parcours-formacompta-paie-et-droit-social.webp'),
 ('gestion-financiere','/visuels/parcours-formacompta-gestion-financiere.webp'),
 ('formation-canva-creer-les-visuels-de-son-activite-sans-graphiste','/visuels/parcours-formadigital-formation-canva-creer-les-visuels-de-son-activite-sans-graphiste.webp'),
 ('formation-excel-et-tableurs-analyser-ses-donnees-et-preparer-l-icdl','/visuels/parcours-formadigital-formation-excel-et-tableurs-analyser-ses-donnees-et-preparer-l-icdl.webp'),
 ('formation-reseaux-sociaux-developper-la-visibilite-de-son-activite','/visuels/parcours-formadigital-formation-reseaux-sociaux-developper-la-visibilite-de-son-activite.webp'),
 ('formation-seo-referencer-soi-meme-le-site-de-son-activite','/visuels/parcours-formadigital-formation-seo-referencer-soi-meme-le-site-de-son-activite.webp'),
 ('formation-teams-slack-et-trello-mieux-travailler-en-equipe','/visuels/parcours-formadigital-formation-teams-slack-et-trello-mieux-travailler-en-equipe.webp'),
 ('formation-prise-en-main-d-un-pc-mac-devenir-autonome-au-travail','/visuels/parcours-formadigital-formation-prise-en-main-d-un-pc-mac-devenir-autonome-au-travail.webp'),
 ('formation-wordpress-creer-et-gerer-le-site-de-son-activite','/visuels/parcours-formadigital-formation-wordpress-creer-et-gerer-le-site-de-son-activite.webp'),
 ('formation-powerpoint-concevoir-des-presentations-claires-et-preparer-l-icdl','/visuels/parcours-formadigital-formation-powerpoint-concevoir-des-presentations-claires-et-preparer-l-icdl.webp'),
 ('formation-google-ads-piloter-ses-campagnes-de-referencement-payant','/visuels/parcours-formadigital-formation-google-ads-piloter-ses-campagnes-de-referencement-payant.webp'),
 ('formation-word-produire-des-documents-professionnels-et-preparer-l-icdl','/visuels/parcours-formadigital-formation-word-produire-des-documents-professionnels-et-preparer-l-icdl.webp'),
 ('le-mecenat-d-entreprise','/visuels/parcours-back-to-business-formatrix-le-mecenat-d-entreprise.webp'),
 ('gestion-et-pilotage-d-entreprise-tpe','/visuels/parcours-back-to-business-formatrix-gestion-et-pilotage-d-entreprise-tpe.webp'))
update programs p set image_url = map.url
from map
where p.slug = map.slug
  and (p.image_url is null or p.image_url like '/visuels/og-%');
commit;
