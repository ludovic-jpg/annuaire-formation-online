import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/redirect";
import { SITE_URL } from "@/lib/env";

/** Retour du lien magique : PKCE (?code=) ou lien à jeton (?token_hash=&type=). */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(url.searchParams.get("suite") ?? url.searchParams.get("next"));
  const supabase = await createClient();

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }
  // L'adresse publique vient de la configuration : derrière le proxy Coolify, request.url vaut http://0.0.0.0:3000.
  const dest = new URL(ok ? next : "/connexion", SITE_URL);
  if (!ok) dest.searchParams.set("erreur", url.searchParams.get("error_code") ?? "lien");
  return NextResponse.redirect(dest);
}
