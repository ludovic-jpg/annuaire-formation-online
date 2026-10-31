# Données d'amorçage

L'amorçage se fait **par la session principale via le connecteur Supabase** (rôle administrateur SQL), à partir d'un fichier JSON de fiches. L'application n'a pas de clé de service : rien n'est importé depuis le code.

## Format attendu (`seed.json`)

```json
{
  "organizations": [
    {
      "name": "Formatrix",
      "slug": "formatrix",
      "siret": "00000000000000",
      "nda": "42680000000",
      "qualiopi": true,
      "website": "https://formatrix.fr",
      "logo_url": "https://annuaire-formation.online/visuels/logo-formatrix.webp",
      "city": "Rixheim",
      "region": "Grand Est",
      "description": "Organisme de formation…",
      "is_group": true,
      "status": "active"
    }
  ],
  "programs": [
    {
      "org_slug": "formatrix",
      "slug": "excel-perfectionnement-formatrix",
      "title": "Maîtriser l'art des tableurs",
      "summary": "Résumé ORIGINAL de 80 à 150 mots (pas de copier-coller de la page source).",
      "objectives": ["Construire un tableau croisé dynamique", "…"],
      "audience": "Salariés, demandeurs d'emploi…",
      "prerequisites": "Aucun",
      "duration_text": "21 heures",
      "price_text": "À partir de 1 290 €",
      "modality": "distanciel",
      "sphere": "digital-bureautique",
      "city": null,
      "certification": "ICDL",
      "cpf_eligible": true,
      "source_url": "https://formatrix.fr/formation/…",
      "image_url": "/visuels/parcours-formatrix-maitriser-lart-des-tableurs.webp",
      "also_offered_by": [{ "name": "Skills4mation", "url": "https://skills4mation.com/formations/…", "rel": "sponsored" }],
      "status": "published",
      "indexable": false
    }
  ]
}
```

## Valeurs contrôlées

| Champ | Valeurs |
|---|---|
| `slug` | `^[a-z0-9]+(-[a-z0-9]+)*$`, unique |
| `modality` | `presentiel`, `distanciel`, `mixte` |
| `sphere` | `digital-bureautique`, `management-rh`, `bien-etre-massage`, `langues`, `vente-commerce`, `comptabilite-finance`, `metiers-specifiques`, `rse-culture`, `bilan-de-competences` |
| `certification` | `LILATE`, `ICDL` ou `null` (seuls parcours certifiants) |
| `status` (programs) | `draft`, `pending`, `published`, `rejected` |
| `status` (organizations) | `pending`, `active`, `rejected` |
| `website`, `source_url` | doivent commencer par `http(s)://` |
| `image_url` | URL absolue ou chemin local `/visuels/…` (voir `/home/claude/mvp/visuels.json`) |

## Règles à respecter

- **Marques du groupe** (Formatrix, Skills4mation, FormaRH, FormaLangue, FormaDigital, FormaVente, FormaBienêtre, FormaCompta, bilandecompetence.pro) : `is_group = true` → le trigger force `link_rel = 'sponsored'`.
- **Une fiche par parcours** : les jumeaux vont dans `also_offered_by` de la fiche principale, pas dans des fiches séparées.
- **Fiches de Ludovic** : `indexable = false` au départ (règle des 30 % tant qu'il n'y a pas assez d'organismes extérieurs).
- `completeness` : calculé par l'application à l'enregistrement ; à l'amorçage, le recalculer ou mettre une valeur estimée (0-100). Le classement l'utilise.
- `published_at` est rempli automatiquement par le trigger quand un admin publie.

## Exemple d'insertion (SQL via le connecteur)

```sql
-- se placer en contexte admin pour que les triggers acceptent is_group / status
select set_config('request.jwt.claims', '{"email":"ludovic@formatrix.fr"}', true);

insert into public.organizations (name, slug, website, city, is_group, status, qualiopi)
values ('Formatrix', 'formatrix', 'https://formatrix.fr', 'Rixheim', true, 'active', true)
on conflict (slug) do update set website = excluded.website;

insert into public.programs (org_id, slug, title, summary, objectives, modality, sphere, source_url, status, indexable, completeness)
select o.id, 'maitriser-lart-des-tableurs', 'Maîtriser l''art des tableurs', '…', array['…'], 'distanciel',
       'digital-bureautique', 'https://formatrix.fr/…', 'published', false, 90
from public.organizations o where o.slug = 'formatrix'
on conflict (slug) do nothing;
```

Note : exécuté en `postgres`/`service_role` sans claims, `is_admin()` renvoie faux et les triggers remettraient `status='pending'` / `is_group=false` sur les organisations : d'où le `set_config` ci-dessus, dans la même transaction.
