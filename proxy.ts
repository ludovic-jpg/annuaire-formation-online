import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Uniquement les zones authentifiées : les pages publiques restent en ISR, sans passage par le proxy.
  matcher: ["/espace/:path*", "/admin/:path*", "/connexion", "/auth/:path*"],
};
