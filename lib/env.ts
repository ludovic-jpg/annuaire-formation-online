export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://annuaire-formation.online").replace(/\/$/, "");
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
export const ADMIN_EMAIL = "ludovic@formatrix.fr";
export const CONTACT_EMAIL = "contact@annuaire-formation.online";
export const SITE_NAME = "Annuaire Formation Online";

export function supabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
