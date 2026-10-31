import type { LinkRel } from "@/lib/types";

/**
 * Règle des liens sortants : le rel vient de organizations.link_rel
 * ('sponsored' pour les marques du groupe Back to Business, 'ugc' sinon).
 * Toujours noopener. Valeur inconnue → ugc par prudence.
 */
export function outboundRel(linkRel?: string | null): string {
  const rel: LinkRel = linkRel === "sponsored" ? "sponsored" : "ugc";
  return `${rel} noopener`;
}

/** Fiche : noindex si indexable = false (ou si non publiée). */
export function programRobots(p: { indexable: boolean; status?: string }) {
  const ok = p.indexable && (p.status === undefined || p.status === "published");
  return { index: ok, follow: true };
}

export const LISTING_MIN_PROGRAMS = 3;
export const LISTING_MIN_ORGS = 2;

/**
 * Pages thème / ville : indexées seulement si ≥ 3 fiches publiées d'au moins 2 organismes.
 * On ne compte que les fiches publiées ET indexables, pour que les fiches du groupe
 * passées en indexable=false (règle des 30 %) ne suffisent pas à rendre une page indexable.
 */
export function isListingIndexable(programs: { org_id: string; indexable: boolean; status?: string }[]) {
  const eligible = programs.filter((p) => p.indexable && (p.status === undefined || p.status === "published"));
  const orgs = new Set(eligible.map((p) => p.org_id));
  return eligible.length >= LISTING_MIN_PROGRAMS && orgs.size >= LISTING_MIN_ORGS;
}
