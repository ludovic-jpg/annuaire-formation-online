import type { SupabaseClient } from "@supabase/supabase-js";
import { lireCredit } from "@/lib/credits-server";
import { peutEnvoyerEnRevue, type Credit } from "@/lib/credits";

/** Organismes de l'utilisateur, avec leur crédit et le droit d'envoyer en revue. */
export async function orgsAvecCredit(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("organizations").select("id, name, slug, is_group, status").eq("owner_id", userId).order("created_at");
  const orgs = (data ?? []) as { id: string; name: string; slug: string; is_group: boolean; status: string }[];
  const credits = await Promise.all(orgs.map((o) => lireCredit(supabase, o)));
  return orgs.map((o, i) => ({ ...o, credit: credits[i] as Credit, peutEnvoyer: peutEnvoyerEnRevue(credits[i]) }));
}
