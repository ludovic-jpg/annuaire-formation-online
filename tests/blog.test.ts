import { describe, expect, it } from "vitest";
import { aujourdhuiParis, faqDepuisMarkdown, parsePost } from "@/lib/blog";

const brut = `---
title: "Mon \\"titre\\""
seoTitle: Titre SEO
description: 'L''essentiel'
keyword: mot
---
# Mon titre

Rédaction : Ludovic Albisser

## Questions fréquentes

### Q1 ?

R1 avec [lien](https://x.fr).

### Q2 ?

R2.

Article rédigé avec l'assistance d'une IA.
`;

describe("blog", () => {
  it("lit l'en-tête et la date du nom de fichier", () => {
    const p = parsePost("2026-11-02-mon-slug.md", brut)!;
    expect(p.date).toBe("2026-11-02");
    expect(p.slug).toBe("mon-slug");
    expect(p.title).toBe('Mon "titre"');
    expect(p.description).toBe("L'essentiel");
    expect(p.body.startsWith("Rédaction")).toBe(true);
  });
  it("ignore les noms de fichier hors format", () => {
    expect(parsePost("brouillon.md", brut)).toBeNull();
  });
  it("extrait la FAQ sans la mention finale", () => {
    expect(faqDepuisMarkdown(parsePost("2026-11-02-a.md", brut)!.body)).toEqual([
      { q: "Q1 ?", a: "R1 avec lien." },
      { q: "Q2 ?", a: "R2." },
    ]);
  });
  it("calcule la date du jour à Paris", () => {
    expect(aujourdhuiParis(new Date("2026-10-31T23:30:00Z"))).toBe("2026-11-01");
  });
});

import { renderMarkdownSur } from "@/lib/blog";
describe("markdown importé", () => {
  it("n'interprète pas le HTML brut", () => {
    const h = renderMarkdownSur('### Module 1\n<script>alert(1)</script>\n<img src=x onerror=alert(1)>');
    expect(h).not.toContain("<script");
    expect(h).not.toContain("<img");
    expect(h).toContain("<h3");
  });
});
