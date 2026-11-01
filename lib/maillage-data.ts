import { allPublishedLight, getOrganization } from "@/lib/data";
import { postsVisibles } from "@/lib/blog";
import { articlesLiesAFiche, fichesLieesAArticle, type ArticleLien, type FicheLien } from "@/lib/maillage";

function articlesFichiers(): ArticleLien[] {
  return postsVisibles().map((p) => ({ slug: p.slug, title: p.title, keyword: p.keyword, org: p.org }));
}

/** Articles à proposer sous une fiche (maillage fiche → articles). */
export async function articlesPourFiche(fiche: { title: string; orgId: string; orgSlug: string }): Promise<ArticleLien[]> {
  const toutes = await allPublishedLight();
  const nbFichesOrg = toutes.filter((f) => f.org_id === fiche.orgId).length;
  return articlesLiesAFiche({ title: fiche.title, orgSlug: fiche.orgSlug, nbFichesOrg }, articlesFichiers());
}

/** Fiches à proposer sous un article (maillage article → fiches). */
export async function fichesPourArticle(article: { title: string; keyword: string; org: string }): Promise<FicheLien[]> {
  const toutes = await allPublishedLight();
  const orgs = new Map<string, string>();
  const o = article.org ? await getOrganization(article.org) : null;
  if (o) orgs.set(o.id, o.slug);
  const compte = new Map<string, number>();
  for (const f of toutes) compte.set(f.org_id, (compte.get(f.org_id) ?? 0) + 1);
  return fichesLieesAArticle(
    article,
    toutes.map((f) => ({ slug: f.slug, title: f.title, orgSlug: orgs.get(f.org_id) ?? "", nbFichesOrg: compte.get(f.org_id) ?? 0 })),
  );
}
