# Annuaire Formation Online

Annuaire de parcours de formation professionnelle — https://annuaire-formation.online
Éditeur : Back to Business SASU (Formatrix), 91 Grand Rue Pierre Braun, 68170 Rixheim.

Stack : Next.js 16 (App Router, `proxy.ts`, sortie `standalone`), Tailwind CSS v4, Supabase (`@supabase/ssr`, Postgres + RLS + Auth par lien magique). Aucune clé de service : toute la sécurité passe par les policies RLS.

## Installation locale

```bash
npm ci
cp .env.example .env.local   # valeurs publiques déjà renseignées
npm run dev                  # http://localhost:3000
```

Scripts : `npm run build`, `npm start`, `npm run lint`, `npm test` (vitest), `npm run typecheck`.

## Variables d'environnement

| Variable | Rôle | Exemple |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL publique (canonicals, sitemap, liens de connexion) | `https://annuaire-formation.online` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | `https://dmtvhlocnxzaitvkiigi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique anon (ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | voir `.env.example` |

Les variables `NEXT_PUBLIC_*` sont **intégrées au build** : dans Docker/Coolify, passez-les en *build arguments* (le Dockerfile a des valeurs par défaut pour l'URL ; la clé anon doit être fournie).

## Base de données

Migrations dans `supabase/migrations/` (idempotentes, à appliquer dans l'ordre) :
- `0001_init.sql` : tables `organizations`, `programs`, `moderation_log`, `waitlist`, `contact_requests`, fonctions `is_admin()` / `owns_org()`, triggers (garde-fous statut/rel/indexation, `updated_at`, organisation en revue au 1er programme), RLS et index.
- `0002_revoke_trigger_functions.sql` : retire l'exécution directe des fonctions de trigger (advisor Supabase).

Données d'amorçage : voir `supabase/seed/README.md`.

### Authentification Supabase
- Site URL : `https://annuaire-formation.online`, redirection autorisée `https://annuaire-formation.online/**`.
- Connexion : `signInWithOtp` → e-mail avec lien magique → `/auth/callback` (gère `?code=` PKCE et `?token_hash=&type=`). `/auth/confirm` est un alias.
- Code à 6 chiffres : champ secondaire sur l'écran « Vérifiez votre boîte mail ». Il ne fonctionne que si le modèle d'e-mail Supabase contient `{{ .Token }}` (nécessite un SMTP personnalisé).
- Administrateur : `ludovic@formatrix.fr` (accès `/admin`).

## Déploiement Coolify (VPS Hostinger)

1. Nouvelle ressource → *Dockerfile* depuis le dépôt GitHub `ludovic-jpg/annuaire-formation-online`, branche `main`.
2. Port exposé : `3000`. Healthcheck intégré : `GET /api/sante`.
3. *Build arguments* : `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Domaine : `annuaire-formation.online` (HTTPS Let's Encrypt par Coolify/Traefik).
5. Conseil du 31/10/2026 : éviter de compiler sur le VPS partagé ; à terme, construire l'image par GitHub Action → GHCR, puis Coolify la tire par webhook.

Image : `docker build --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=… -t annuaire . && docker run -p 3000:3000 annuaire`.

## Règles métier (résumé)

- Une fiche = un parcours ; « Aussi proposé par » pour les jumeaux du groupe (`also_offered_by`).
- Statuts : Brouillon → En revue → Publiée / Refusée (motif). Seul l'admin publie.
- Liens sortants : `rel="sponsored noopener"` pour les marques du groupe, `rel="ugc noopener"` sinon.
- Indexation : fiche `noindex` si `indexable=false` ; pages thème/ville indexées si ≥ 3 fiches indexables de ≥ 2 organismes.
- Classement : pertinence, complétude, date. Aucun critère payant (page `/comment-fonctionne-le-classement`).

## Arborescence

```
app/                 pages (vitrine, formations, fiche, organisme, thème, ville, espace, admin, légal)
app/espace/actions.ts  actions serveur de l'espace OF (autosave, envoi en revue…)
app/admin/actions.ts   modération
components/          UI partagée (Mascotte, ProgramCard, Confetti…)
lib/                 données, règles (rel, indexation), complétude, Supabase
supabase/            migrations SQL et format d'amorçage
tests/               vitest
proxy.ts             rafraîchissement de session + garde /espace /admin
```
