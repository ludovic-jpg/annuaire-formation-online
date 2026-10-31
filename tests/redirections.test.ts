import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/env";
import { safeNext } from "@/lib/redirect";

describe("redirections d'authentification", () => {
  it("construit toujours l'adresse publique, jamais l'adresse interne du serveur", () => {
    const dest = new URL(safeNext("/espace"), SITE_URL);
    expect(dest.origin).toBe(SITE_URL);
    expect(dest.href).not.toContain("0.0.0.0");
  });
  it("refuse les redirections vers un autre site", () => {
    expect(safeNext("//evil.example")).toBe("/espace");
    expect(safeNext("https://evil.example")).toBe("/espace");
  });
});
