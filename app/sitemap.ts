import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";
import { SPHERES } from "@/lib/spheres";
import { activeOrganizationsLight, allPublishedLight } from "@/lib/data";
import { isListingIndexable } from "@/lib/regles";
import { slugify } from "@/lib/slug";

export const revalidate = 300;

/** Ne contient que des URL indexables (fiches indexables, pages thème/ville au-dessus du seuil). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [programs, orgs] = await Promise.all([allPublishedLight(), activeOrganizationsLight()]);
  const now = new Date();
  const statics = ["", "/formations", "/publier", "/comment-fonctionne-le-classement", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
  }));

  const fiches = programs.filter((p) => p.indexable).map((p) => ({ url: `${SITE_URL}/formation/${p.slug}`, lastModified: new Date(p.updated_at) }));

  const themes = SPHERES.filter((s) => isListingIndexable(programs.filter((p) => p.sphere === s.slug))).map((s) => ({
    url: `${SITE_URL}/theme/${s.slug}`,
    lastModified: now,
  }));

  const byCity = new Map<string, typeof programs>();
  for (const p of programs) if (p.city) byCity.set(p.city, [...(byCity.get(p.city) ?? []), p]);
  const villes = [...byCity.entries()].filter(([, list]) => isListingIndexable(list)).map(([city]) => ({
    url: `${SITE_URL}/ville/${slugify(city)}`,
    lastModified: now,
  }));



  const organismes = orgs.map((o) => ({ url: `${SITE_URL}/organisme/${o.slug}`, lastModified: new Date(o.created_at) }));

  return [...statics, ...themes, ...villes, ...fiches, ...organismes];
}
