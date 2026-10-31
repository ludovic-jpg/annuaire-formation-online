import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { SPHERES } from "@/lib/spheres";
import { allPublishedLight, activeOrganizationsLight } from "@/lib/data";
import { isListingIndexable } from "@/lib/regles";
import { slugify } from "@/lib/slug";
import { postsVisibles } from "@/lib/blog";

export const revalidate = 300;

const plusRecent = (dates: string[]) =>
  dates.length ? new Date(Math.max(...dates.map((d) => new Date(d).getTime()))) : undefined;

/**
 * Ne contient que des URL indexables :
 * - pages fixes indexables (pas /connexion, /liste-attente, /espace, /admin) ;
 * - fiches publiées avec indexable = true ;
 * - pages thème / ville au-dessus du seuil (isListingIndexable) ;
 * - pages organisme ayant au moins une fiche indexable (sinon la page est en noindex).
 * lastModified = date réelle de la fiche la plus récente, jamais « maintenant » par défaut.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, orgs] = await Promise.all([allPublishedLight(), activeOrganizationsLight()]);
  const indexables = programs.filter((p) => p.indexable);
  const derniere = plusRecent(programs.map((p) => p.updated_at));

  const statics: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: derniere },
    { url: `${SITE_URL}/formations`, lastModified: derniere },
    { url: `${SITE_URL}/publier` },
    { url: `${SITE_URL}/a-propos` },
    { url: `${SITE_URL}/comment-fonctionne-le-classement` },
    { url: `${SITE_URL}/contact` },
  ];

  const posts = postsVisibles();
  const blog: MetadataRoute.Sitemap = posts.length === 0 ? [] : [
    { url: `${SITE_URL}/blog`, lastModified: new Date(`${posts[0].date}T06:00:00Z`) },
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: new Date(`${p.date}T06:00:00Z`) })),
  ];

  const fiches = indexables.map((p) => ({ url: `${SITE_URL}/formation/${p.slug}`, lastModified: new Date(p.updated_at) }));

  const themes = SPHERES.flatMap((s) => {
    const list = programs.filter((p) => p.sphere === s.slug);
    return isListingIndexable(list) ? [{ url: `${SITE_URL}/theme/${s.slug}`, lastModified: plusRecent(list.map((p) => p.updated_at)) }] : [];
  });

  const byCity = new Map<string, typeof programs>();
  for (const p of programs) if (p.city) byCity.set(p.city, [...(byCity.get(p.city) ?? []), p]);
  const villes = [...byCity.entries()]
    .filter(([, list]) => isListingIndexable(list))
    .map(([city, list]) => ({ url: `${SITE_URL}/ville/${slugify(city)}`, lastModified: plusRecent(list.map((p) => p.updated_at)) }));

  const orgsIndexables = new Map<string, string[]>();
  for (const p of indexables) orgsIndexables.set(p.org_id, [...(orgsIndexables.get(p.org_id) ?? []), p.updated_at]);
  const organismes = orgs
    .filter((o) => orgsIndexables.has(o.id))
    .map((o) => ({ url: `${SITE_URL}/organisme/${o.slug}`, lastModified: plusRecent(orgsIndexables.get(o.id)!) }));

  return [...statics, ...blog, ...themes, ...villes, ...fiches, ...organismes];
}
