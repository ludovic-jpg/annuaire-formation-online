import { publicClient } from "@/lib/supabase/public";
import type { Organization, ProgramWithOrg } from "@/lib/types";

const ORG_JOIN = "organizations!inner(id, name, slug, link_rel, is_group, qualiopi, website, city, logo_url, nda)";
// Listes : sans les rubriques longues de la matrice (programme, modalités…), réservées à la fiche.
const PROGRAM_SELECT =
  "id, org_id, slug, title, summary, objectives, audience, prerequisites, duration_text, price_text, modality, sphere, city, certification, cpf_eligible, source_url, image_url, also_offered_by, status, reject_reason, completeness, indexable, created_at, updated_at, published_at, level_text, short_objective, source_site, " +
  ORG_JOIN;
const PROGRAM_FULL_SELECT = "*, " + ORG_JOIN;

export type ProgramFilters = {
  q?: string;
  sphere?: string;
  modality?: string;
  city?: string;
  cpf?: boolean;
  certification?: string;
  limit?: number;
  offset?: number;
};

/**
 * Classement par défaut (documenté sur /comment-fonctionne-le-classement) :
 * pertinence textuelle si recherche, puis complétude de la fiche, puis date de publication.
 * Aucun critère payant. Les fiches du groupe ne sont pas favorisées.
 */
export async function searchPrograms(f: ProgramFilters = {}) {
  const sb = publicClient();
  if (!sb) return { items: [] as ProgramWithOrg[], count: 0 };
  let q = sb.from("programs").select(PROGRAM_SELECT, { count: "exact" }).eq("status", "published");
  if (f.q?.trim()) q = q.textSearch("search", f.q.trim(), { type: "websearch", config: "french" });
  if (f.sphere) q = q.eq("sphere", f.sphere);
  if (f.modality) q = q.eq("modality", f.modality);
  if (f.city) q = q.ilike("city", f.city.replace(/[%_]/g, ""));
  if (f.cpf) q = q.eq("cpf_eligible", true);
  if (f.certification) q = q.eq("certification", f.certification);
  const limit = f.limit ?? 24;
  const offset = f.offset ?? 0;
  q = q
    .order("completeness", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);
  const { data, count, error } = await q;
  if (error) {
    console.error("searchPrograms", error.message);
    return { items: [], count: 0 };
  }
  return { items: (data ?? []) as unknown as ProgramWithOrg[], count: count ?? 0 };
}

export async function latestPrograms(limit = 6) {
  const sb = publicClient();
  if (!sb) return [] as ProgramWithOrg[];
  const { data } = await sb
    .from("programs")
    .select(PROGRAM_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data ?? []) as unknown as ProgramWithOrg[];
}

export async function getProgram(slug: string) {
  const sb = publicClient();
  if (!sb) return null;
  const { data } = await sb.from("programs").select(PROGRAM_FULL_SELECT).eq("slug", slug).eq("status", "published").maybeSingle();
  return (data as unknown as ProgramWithOrg) ?? null;
}

export async function getOrganization(slug: string) {
  const sb = publicClient();
  if (!sb) return null;
  const { data } = await sb.from("organizations").select("*").eq("slug", slug).eq("status", "active").maybeSingle();
  return (data as Organization) ?? null;
}

export async function programsByOrg(orgId: string) {
  const sb = publicClient();
  if (!sb) return [] as ProgramWithOrg[];
  const { data } = await sb
    .from("programs")
    .select(PROGRAM_SELECT)
    .eq("status", "published")
    .eq("org_id", orgId)
    .order("title");
  return (data ?? []) as unknown as ProgramWithOrg[];
}

export async function programsBySphere(sphere: string) {
  const sb = publicClient();
  if (!sb) return [] as ProgramWithOrg[];
  const { data } = await sb
    .from("programs")
    .select(PROGRAM_SELECT)
    .eq("status", "published")
    .eq("sphere", sphere)
    .order("completeness", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(200);
  return (data ?? []) as unknown as ProgramWithOrg[];
}

export type LightProgram = {
  slug: string;
  title: string;
  org_id: string;
  sphere: string | null;
  city: string | null;
  indexable: boolean;
  updated_at: string;
  summary: string | null;
  duration_text: string | null;
  modality: string | null;
  cpf_eligible: boolean;
  certification: string | null;
};

/** Toutes les fiches publiées (champs légers) : sitemap, compteurs, llms.txt. */
export async function allPublishedLight() {
  const sb = publicClient();
  if (!sb) return [] as LightProgram[];
  const { data } = await sb
    .from("programs")
    .select("slug, title, org_id, sphere, city, indexable, updated_at, summary, duration_text, modality, cpf_eligible, certification")
    .eq("status", "published")
    .limit(5000);
  return (data ?? []) as LightProgram[];
}

export async function activeOrganizationsLight() {
  const sb = publicClient();
  if (!sb) return [] as { id: string; slug: string; name: string; created_at: string }[];
  const { data } = await sb.from("organizations").select("id, slug, name, created_at").eq("status", "active").limit(5000);
  return data ?? [];
}

export async function cityList() {
  const all = await allPublishedLight();
  const counts = new Map<string, number>();
  for (const p of all) if (p.city) counts.set(p.city, (counts.get(p.city) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([city]) => city);
}

export async function programsByCitySlug(citySlug: string, slugify: (s: string) => string) {
  const all = await allPublishedLight();
  const match = all.find((p) => p.city && slugify(p.city) === citySlug)?.city;
  if (!match) return { city: null as string | null, programs: [] as ProgramWithOrg[] };
  const sb = publicClient();
  if (!sb) return { city: match, programs: [] as ProgramWithOrg[] };
  const { data } = await sb
    .from("programs")
    .select(PROGRAM_SELECT)
    .eq("status", "published")
    .eq("city", match)
    .order("completeness", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(200);
  return { city: match, programs: (data ?? []) as unknown as ProgramWithOrg[] };
}

/** Maillage interne : autres fiches publiées du même thème (indexables d'abord, puis complétude). */
export async function relatedPrograms(sphere: string, excludeId: string, limit = 3) {
  const sb = publicClient();
  if (!sb) return [] as ProgramWithOrg[];
  const { data } = await sb
    .from("programs")
    .select(PROGRAM_SELECT)
    .eq("status", "published")
    .eq("sphere", sphere)
    .neq("id", excludeId)
    .order("indexable", { ascending: false })
    .order("completeness", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data ?? []) as unknown as ProgramWithOrg[];
}
