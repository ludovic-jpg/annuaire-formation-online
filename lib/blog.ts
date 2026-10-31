import fs from "node:fs";
import path from "node:path";
import { Marked, marked } from "marked";

/**
 * Blog alimenté par « La Rotative » (tâche planifiée) : un fichier par article dans
 * content/blog/posts/AAAA-MM-JJ-<slug>.md, en-tête YAML simple :
 * title, seoTitle, description, image, imageAlt, keyword.
 * La date du nom de fichier est la date de visibilité (fuseau Europe/Paris) :
 * un fichier daté dans le futur est déjà dans l'image mais reste invisible jusqu'à ce jour.
 */

export type Post = {
  slug: string;
  date: string; // AAAA-MM-JJ
  title: string;
  seoTitle: string;
  description: string;
  image: string;
  imageAlt: string;
  keyword: string;
  body: string; // Markdown, sans le H1
};

const DIR = path.join(process.cwd(), "content", "blog", "posts");
const FICHIER = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)\.md$/;

export function aujourdhuiParis(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

function lireValeur(v: string): string {
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    const inner = t.slice(1, -1);
    return t.startsWith('"') ? inner.replace(/\\"/g, '"') : inner.replace(/''/g, "'");
  }
  return t;
}

export function parsePost(nomFichier: string, brut: string): Post | null {
  const m = FICHIER.exec(nomFichier);
  if (!m) return null;
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(brut);
  const champs: Record<string, string> = {};
  let body = brut;
  if (fm) {
    for (const ligne of fm[1].split(/\r?\n/)) {
      const i = ligne.indexOf(":");
      if (i > 0) champs[ligne.slice(0, i).trim()] = lireValeur(ligne.slice(i + 1));
    }
    body = fm[2];
  }
  // Le corps ne doit pas répéter le H1 : on retire un éventuel « # Titre » initial.
  body = body.replace(/^\s*#\s+[^\n]+\n+/, "");
  const title = champs.title || m[2].replace(/-/g, " ");
  return {
    slug: m[2],
    date: m[1],
    title,
    seoTitle: champs.seoTitle || title,
    description: champs.description || "",
    image: champs.image || "",
    imageAlt: champs.imageAlt || "",
    keyword: champs.keyword || "",
    body,
  };
}

function tousLesPosts(): Post[] {
  let fichiers: string[] = [];
  try {
    fichiers = fs.readdirSync(DIR);
  } catch {
    return [];
  }
  const posts: Post[] = [];
  for (const f of fichiers) {
    if (!FICHIER.test(f)) continue;
    const p = parsePost(f, fs.readFileSync(path.join(DIR, f), "utf8"));
    if (p) posts.push(p);
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

/** Articles visibles aujourd'hui (date ≤ aujourd'hui, heure de Paris), du plus récent au plus ancien. */
export function postsVisibles(now = new Date()): Post[] {
  const jour = aujourdhuiParis(now);
  return tousLesPosts().filter((p) => p.date <= jour);
}

export function postVisible(slug: string, now = new Date()): Post | null {
  return postsVisibles(now).find((p) => p.slug === slug) ?? null;
}

export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false, gfm: true }) as string;
}

const echapper = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Pour les contenus importés (pages des organismes) : tout HTML brut est affiché comme du texte, jamais interprété.
const markedSur = new Marked({ gfm: true, breaks: true, renderer: { html: ({ text }) => echapper(text) } });

export function renderMarkdownSur(md: string): string {
  return markedSur.parse(md, { async: false }) as string;
}

/** Extrait les questions/réponses de la section « Questions fréquentes » (H3 + paragraphes) pour le JSON-LD. */
export function faqDepuisMarkdown(md: string): { q: string; a: string }[] {
  const sec = /##\s+Questions fréquentes\s*\n([\s\S]*?)(?=\n##\s|\n*$)/i.exec(md);
  if (!sec) return [];
  const out: { q: string; a: string }[] = [];
  const re = /###\s+([^\n]+)\n+([\s\S]*?)(?=\n###\s|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sec[1]))) {
    const a = m[2].replace(/\n*Article rédigé[\s\S]*$/, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_`]/g, "").trim();
    if (a) out.push({ q: m[1].trim(), a });
  }
  return out;
}

export function formaterDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
}

export function tempsDeLecture(md: string): number {
  return Math.max(1, Math.round(md.split(/\s+/).filter(Boolean).length / 220));
}
