import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/env";

let cached: SupabaseClient | null = null;

/**
 * Client anonyme sans cookies : utilisé par les pages publiques en ISR
 * (aucun appel à cookies() → la page reste statique et revalidée).
 * RLS ne laisse voir que les fiches publiées d'organismes actifs.
 */
export function publicClient(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (!cached) {
    cached = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}
