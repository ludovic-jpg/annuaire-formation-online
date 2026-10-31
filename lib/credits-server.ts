import type { SupabaseClient } from "@supabase/supabase-js";
import type { Credit, LigneCredit } from "@/lib/credits";

/**
 * Solde et historique d'un organisme (client lié à la session : RLS credit_ledger_select_own).
 * Si la migration 0005 n'est pas appliquée, renvoie actif = false sans rien bloquer.
 */
export async function lireCredit(supabase: SupabaseClient, org: { id: string; is_group: boolean }): Promise<Credit> {
  const inactif: Credit = { actif: false, groupe: org.is_group, soldeCents: null, historique: [] };
  try {
    const [solde, lignes] = await Promise.all([
      supabase.rpc("org_balance_cents", { p_org: org.id }),
      supabase.from("credit_ledger").select("id, amount_cents, reason, created_at").eq("org_id", org.id).order("created_at", { ascending: false }).limit(50),
    ]);
    if (solde.error || lignes.error) return inactif;
    return { actif: true, groupe: org.is_group, soldeCents: Number(solde.data ?? 0), historique: (lignes.data ?? []) as LigneCredit[] };
  } catch {
    return inactif;
  }
}
