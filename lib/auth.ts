import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/env";

export async function requireUser(next = "/espace") {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect(`/connexion?suite=${encodeURIComponent(next)}`);
  return { supabase, user, isAdmin: user.email.toLowerCase() === ADMIN_EMAIL };
}

export async function requireAdmin() {
  const ctx = await requireUser("/admin");
  if (!ctx.isAdmin) redirect("/espace");
  return ctx;
}
