/**
 * Maillage interne fiches ⇄ articles.
 * Un article est lié à une fiche quand leurs mots-clés se recoupent (titre, mot-clé de l'article),
 * ou quand l'article de marque est écrit par le même organisme et que la marque est petite
 * (sinon un article se retrouverait sur des dizaines de fiches sans rapport).
 */
const MOTS_VIDES = new Set([
  "formation", "formations", "parcours", "entreprise", "guide", "pratique", "comment", "pourquoi", "avec", "pour", "dans",
  "votre", "vous", "nous", "cette", "leurs", "leur", "plus", "sans", "sont", "être", "faire", "donc", "alors",
]);

function normaliser(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function motsCles(texte: string): Set<string> {
  return new Set(
    normaliser(texte)
      .split(/[^a-z0-9]+/)
      .filter((m) => m.length >= 5 && !MOTS_VIDES.has(m))
      // racine grossière : « comptabilite » et « comptable » partagent « compta »
      .map((m) => m.slice(0, 6)),
  );
}

export const SEUIL_PETITE_MARQUE = 12;

export type ArticleLien = { slug: string; title: string; keyword: string; org: string };
export type FicheLien = { slug: string; title: string };

export function chevauchement(a: string, b: string): number {
  const A = motsCles(a);
  let n = 0;
  for (const m of motsCles(b)) if (A.has(m)) n++;
  return n;
}

export function articlesLiesAFiche(
  fiche: { title: string; orgSlug: string; nbFichesOrg: number },
  articles: ArticleLien[],
  max = 3,
): ArticleLien[] {
  return articles
    .map((a) => {
      const recoupe = chevauchement(fiche.title, `${a.keyword} ${a.title}`);
      const memeOrg = a.org !== "" && a.org === fiche.orgSlug;
      const ok = recoupe >= 1 || (memeOrg && fiche.nbFichesOrg <= SEUIL_PETITE_MARQUE);
      return { a, score: ok ? recoupe * 2 + (memeOrg ? 1 : 0) : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, max)
    .map((x) => x.a);
}

export function fichesLieesAArticle(
  article: { title: string; keyword: string; org: string },
  fiches: (FicheLien & { orgSlug: string; nbFichesOrg: number })[],
  max = 4,
): FicheLien[] {
  return fiches
    .map((f) => {
      const recoupe = chevauchement(f.title, `${article.keyword} ${article.title}`);
      const memeOrg = article.org !== "" && article.org === f.orgSlug;
      const ok = recoupe >= 1 || (memeOrg && f.nbFichesOrg <= SEUIL_PETITE_MARQUE);
      return { f, score: ok ? recoupe * 2 + (memeOrg ? 1 : 0) : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, max)
    .map((x) => ({ slug: x.f.slug, title: x.f.title }));
}
