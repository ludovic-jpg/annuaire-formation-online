import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

/**
 * /connexion et /liste-attente ne sont pas bloquées : elles portent un noindex que les robots doivent pouvoir lire
 * (une URL bloquée par robots.txt peut être indexée sans contenu si elle reçoit des liens).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/espace", "/admin", "/auth"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
