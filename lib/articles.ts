/**
 * Articles des organismes (table public.posts, migration 0005) : logique pure,
 * sans accès réseau ni système de fichiers (testée par vitest, importable côté client).
 */
import { slugify } from "@/lib/slug";

export const TITRE_MIN = 10;
export const TITRE_MAX = 140;
export const DESC_MIN = 140;
export const DESC_MAX = 158;
export const MOTS_MIN_REVUE = 300;
export const SLUG_MAX = 80;
export const CORPS_MAX = 60000;
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export type PostStatus = "draft" | "pending" | "published" | "rejected";

export type ArticleChamp = "title" | "slug" | "description" | "keyword" | "body_md" | "cover_url";
export type ArticleErreurs = Partial<Record<ArticleChamp, string>>;

export type ArticleSaisie = {
  title: string;
  slug: string;
  description: string;
  keyword: string;
  body_md: string;
  cover_url: string;
};

export type ArticlePropre = {
  title: string;
  slug: string;
  description: string | null;
  keyword: string | null;
  body_md: string;
  cover_url: string | null;
};

/** Slug d'article : minuscules, sans accents, mots séparés par un tiret, 80 caractères au plus. */
export function slugArticle(titre: string): string {
  return slugify(titre ?? "", SLUG_MAX);
}

/** Même règle que la colonne générée posts.word_count (découpe sur les blancs). */
export function compterMots(md: string): number {
  const t = (md ?? "").trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Le titre est affiché en H1 par la page : on retire un « # Titre » initial et on rétrograde les autres H1 en H2. */
export function normaliserCorps(md: string): string {
  return (md ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/^\s*#\s+[^\n]+\n+/, "")
    .replace(/^#\s+/gm, "## ");
}

function urlHttp(v: string): string | null {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/**
 * Validation serveur (et client, pour les messages en direct).
 * - « brouillon » : titre et adresse valides suffisent (contraintes de la base).
 * - « revue » : en plus, description 140 à 158 caractères, mot-clé, 300 mots au moins.
 */
export function validerArticle(
  s: Partial<ArticleSaisie>,
  mode: "brouillon" | "revue",
  slugsReserves: Iterable<string> = [],
): { data: ArticlePropre; erreurs: ArticleErreurs; ok: boolean } {
  const erreurs: ArticleErreurs = {};
  const title = String(s.title ?? "").replace(/\s+/g, " ").trim();
  const slugSaisi = String(s.slug ?? "").trim().toLowerCase();
  const slug = slugSaisi || slugArticle(title);
  const description = String(s.description ?? "").replace(/\s+/g, " ").trim();
  const keyword = String(s.keyword ?? "").replace(/\s+/g, " ").trim();
  const body_md = String(s.body_md ?? "").replace(/\r\n/g, "\n").trim();
  const coverBrut = String(s.cover_url ?? "").trim();

  if (title.length < TITRE_MIN) erreurs.title = `Le titre doit compter au moins ${TITRE_MIN} caractères.`;
  else if (title.length > TITRE_MAX) erreurs.title = `Le titre ne doit pas dépasser ${TITRE_MAX} caractères.`;

  if (!slug) erreurs.slug = "Indiquez l'adresse de l'article.";
  else if (slug.length > SLUG_MAX) erreurs.slug = `L'adresse ne doit pas dépasser ${SLUG_MAX} caractères.`;
  else if (!SLUG_RE.test(slug)) erreurs.slug = "Utilisez seulement des lettres minuscules sans accent, des chiffres et des tirets simples.";
  else if (new Set(slugsReserves).has(slug)) erreurs.slug = "Cette adresse est déjà prise par un article de l'annuaire. Choisissez-en une autre.";

  if (description.length > 300) erreurs.description = "La description est trop longue (300 caractères au plus).";
  if (keyword.length > 80) erreurs.keyword = "Le mot-clé ne doit pas dépasser 80 caractères.";
  if (body_md.length > CORPS_MAX) erreurs.body_md = "L'article est trop long (60 000 caractères au plus).";

  let cover_url: string | null = null;
  if (coverBrut) {
    cover_url = urlHttp(coverBrut);
    if (!cover_url) erreurs.cover_url = "L'adresse de l'image doit commencer par https:// et être complète.";
  }

  if (mode === "revue") {
    if (!erreurs.description && (description.length < DESC_MIN || description.length > DESC_MAX))
      erreurs.description = `La description doit compter entre ${DESC_MIN} et ${DESC_MAX} caractères (actuellement ${description.length}).`;
    if (!keyword) erreurs.keyword = "Indiquez le mot-clé principal de l'article.";
    const mots = compterMots(body_md);
    if (!erreurs.body_md && mots < MOTS_MIN_REVUE) erreurs.body_md = `L'article doit compter au moins ${MOTS_MIN_REVUE} mots (actuellement ${mots}).`;
  }

  return {
    data: { title, slug, description: description || null, keyword: keyword || null, body_md, cover_url },
    erreurs,
    ok: Object.keys(erreurs).length === 0,
  };
}

/**
 * Post-traitement du HTML rendu d'un article d'organisme :
 * - liens externes (http/https vers un autre domaine que le site) : rel imposé, « ugc noopener »
 *   pour un organisme extérieur, « sponsored noopener » pour une marque du groupe ;
 * - liens à protocole douteux (javascript:, data:…) neutralisés.
 * Les liens internes (relatifs, ancres, même domaine) et mailto: restent tels quels.
 */
export function reecrireLiensSortants(html: string, rel: "ugc" | "sponsored", siteUrl: string): string {
  let hoteSite = "";
  try {
    hoteSite = new URL(siteUrl).host.replace(/^www\./, "");
  } catch {
    hoteSite = "";
  }
  return html.replace(/<a\s+([^>]*)>/gi, (_tout, attrs: string) => {
    const m = /href="([^"]*)"/i.exec(attrs);
    if (!m) return `<a ${attrs}>`;
    const href = m[1];
    const sansRel = attrs.replace(/\s*\brel="[^"]*"/gi, "").replace(/\s*\btarget="[^"]*"/gi, "").trim();
    if (/^https?:\/\//i.test(href)) {
      let hote = "";
      try {
        hote = new URL(href.replace(/&amp;/g, "&")).host.replace(/^www\./, "");
      } catch {
        return `<a ${sansRel.replace(/href="[^"]*"/i, 'href="#"')}>`;
      }
      if (hoteSite && hote === hoteSite) return `<a ${sansRel}>`;
      return `<a ${sansRel} rel="${rel} noopener">`;
    }
    if (/^(\/|#|mailto:)/i.test(href) || /^[^:]*$/.test(href)) return `<a ${sansRel}>`;
    return `<a ${sansRel.replace(/href="[^"]*"/i, 'href="#"')}>`;
  });
}

export function relDeLorganisme(o: { is_group?: boolean | null; link_rel?: string | null } | null | undefined): "ugc" | "sponsored" {
  return o?.is_group || o?.link_rel === "sponsored" ? "sponsored" : "ugc";
}

/* ------------------------------------------------------------------ */
/* Blog unifié : articles fichiers (La Rotative) + articles d'organismes */
/* ------------------------------------------------------------------ */

export type OrgPostPublic = {
  id: string;
  slug: string;
  title: string;
  seo_title: string | null;
  description: string | null;
  keyword: string | null;
  body_md: string;
  cover_url: string | null;
  published_at: string | null;
  updated_at: string;
  organizations: { name: string; slug: string; is_group: boolean; link_rel: string | null; logo_url: string | null; website: string | null };
};

export type EntreeBlog = {
  source: "fichier" | "organisme";
  slug: string;
  date: string; // AAAA-MM-JJ
  title: string;
  description: string;
  image: string;
  body: string;
  org: { name: string; slug: string; is_group: boolean } | null;
};

type FichierMin = { slug: string; date: string; title: string; description: string; image: string; body: string };

export const jourIso = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);

/** Fusionne les deux sources, du plus récent au plus ancien ; en cas de slug identique, l'article fichier l'emporte. */
export function fusionnerBlog(fichiers: FichierMin[], organismes: OrgPostPublic[]): EntreeBlog[] {
  const pris = new Set(fichiers.map((f) => f.slug));
  const out: EntreeBlog[] = fichiers.map((f) => ({
    source: "fichier",
    slug: f.slug,
    date: f.date,
    title: f.title,
    description: f.description,
    image: f.image,
    body: f.body,
    org: null,
  }));
  for (const p of organismes) {
    if (pris.has(p.slug)) continue;
    pris.add(p.slug);
    out.push({
      source: "organisme",
      slug: p.slug,
      date: jourIso(p.published_at ?? p.updated_at),
      title: p.title,
      description: p.description ?? "",
      image: p.cover_url ?? "",
      body: p.body_md,
      org: { name: p.organizations.name, slug: p.organizations.slug, is_group: p.organizations.is_group },
    });
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}
