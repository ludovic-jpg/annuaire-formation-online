import type { SupabaseClient } from "@supabase/supabase-js";
import { publicClient } from "@/lib/supabase/public";
import type { OrgPostPublic } from "@/lib/articles";

/**
 * Lecture publique des articles d'organismes (RLS : publiés, organisme actif).
 * Tolérant : si la table posts n'existe pas encore (migration 0005 non appliquée)
 * ou si la requête échoue, on renvoie une liste vide et le blog n'affiche que les articles fichiers.
 */
const SELECT_PUBLIC =
  "id, slug, title, seo_title, description, keyword, body_md, cover_url, published_at, updated_at, organizations!inner(name, slug, is_group, link_rel, logo_url, website)";

async function essayer<T>(label: string, f: (sb: SupabaseClient) => PromiseLike<{ data: unknown; error: { message: string } | null }>, vide: T): Promise<T> {
  const sb = publicClient();
  if (!sb) return vide;
  try {
    const { data, error } = await f(sb);
    if (error) {
      console.warn(`${label} : ${error.message}`);
      return vide;
    }
    return (data ?? vide) as T;
  } catch (e) {
    console.warn(`${label} : ${(e as Error).message}`);
    return vide;
  }
}

export function orgPostsPublies(limit = 500): Promise<OrgPostPublic[]> {
  return essayer(
    "orgPostsPublies",
    (sb) => sb.from("posts").select(SELECT_PUBLIC).eq("status", "published").order("published_at", { ascending: false }).limit(limit),
    [] as OrgPostPublic[],
  );
}

export function orgPostPublie(slug: string): Promise<OrgPostPublic | null> {
  return essayer(
    "orgPostPublie",
    (sb) => sb.from("posts").select(SELECT_PUBLIC).eq("slug", slug).eq("status", "published").maybeSingle(),
    null as OrgPostPublic | null,
  );
}

export function orgPostsParOrganisme(orgId: string): Promise<OrgPostPublic[]> {
  return essayer(
    "orgPostsParOrganisme",
    (sb) => sb.from("posts").select(SELECT_PUBLIC).eq("status", "published").eq("org_id", orgId).order("published_at", { ascending: false }).limit(100),
    [] as OrgPostPublic[],
  );
}
