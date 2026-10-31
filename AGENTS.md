<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Règles du projet Annuaire Formation Online

- Tout en français (interface, contenus, commits). Commits terminés par les lignes Co-Authored-By / Claude-Session.
- Stack : Next.js 16 App Router (`proxy.ts`, params asynchrones), Tailwind v4 (`@theme` dans `app/globals.css`), `@supabase/ssr`. Cache Components désactivé : ISR classique `export const revalidate = 300`.
- Pages publiques : client Supabase **sans cookies** (`lib/supabase/public.ts`) pour rester en ISR. Espace OF / admin : `lib/supabase/server.ts` + `requireUser()` / `requireAdmin()` (toujours revérifier côté serveur, le proxy ne suffit pas).
- **Aucune clé de service.** Toute la sécurité passe par RLS (`supabase/migrations`). Toute modification de schéma = nouveau fichier `000N_*.sql` idempotent, jamais d'édition d'une migration appliquée.
- Admin = `is_admin()` : e-mail du JWT = ludovic@formatrix.fr.
- Statuts : un OF ne peut mettre une fiche qu'en `draft` ou `pending` ; seul l'admin publie / refuse (motif obligatoire, `moderation_log`).
- Liens sortants : `rel` = `organizations.link_rel` (`sponsored` pour les marques du groupe, `ugc` sinon) + `noopener`, via `outboundRel()` dans `lib/regles.ts`. Jamais de lien dofollow.
- Indexation : fiche `noindex` si `indexable=false` ; pages thème/ville indexées seulement si ≥ 3 fiches publiées **indexables** d'au moins 2 organismes (`isListingIndexable`). Le sitemap ne liste que l'indexable.
- Règle des 30 % : les fiches du groupe ne dépassent pas 30 % des fiches indexées (indicateur dans /admin, bascule « Indexable/Noindex »).
- Transparence (D111-6 C. conso) : mention « Organisme lié à l'éditeur » sur les fiches du groupe ; page /comment-fonctionne-le-classement accessible depuis le pied de page.
- DA : vitrine néobrutaliste (`.brut`, `.btn`, `.dots`, jaune #FFCD1C / bleu nuit #14206B / encre #0D1240) ; formulaires et espace OF en version calme (`.calm-card`, `.field`). Pas de texte sur jaune sauf encre. `prefers-reduced-motion` respecté.
- Tests : `npm test` (vitest) couvre complétude, rel et indexation. `npm run lint` et `npm run build` doivent passer avant chaque push.
