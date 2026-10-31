import { describe, expect, it } from "vitest";
import {
  DESC_MIN,
  compterMots,
  fusionnerBlog,
  normaliserCorps,
  reecrireLiensSortants,
  relDeLorganisme,
  slugArticle,
  validerArticle,
  type OrgPostPublic,
} from "@/lib/articles";
import { renderMarkdownSur } from "@/lib/markdown";
import { estErreurCredit, formaterEuros, peutEnvoyerEnRevue } from "@/lib/credits";

const SITE = "https://annuaire-formation.online";
const mots = (n: number) => Array.from({ length: n }, (_, i) => `mot${i}`).join(" ");
const desc = "d".repeat(DESC_MIN);

describe("slugArticle", () => {
  it("retire accents, ponctuation et espaces", () => {
    expect(slugArticle("Être formé à l'Œnologie : 5 conseils !")).toBe("etre-forme-a-l-oenologie-5-conseils");
  });
  it("coupe à 80 caractères sans tiret final", () => {
    const s = slugArticle("mot ".repeat(40));
    expect(s.length).toBeLessThanOrEqual(80);
    expect(s.endsWith("-")).toBe(false);
  });
});

describe("compterMots et normaliserCorps", () => {
  it("compte comme la colonne générée", () => {
    expect(compterMots("")).toBe(0);
    expect(compterMots("  un\n\ndeux   trois ")).toBe(3);
  });
  it("retire le H1 initial et rétrograde les autres H1", () => {
    expect(normaliserCorps("# Titre\n\nTexte\n# Autre")).toBe("Texte\n## Autre");
  });
});

describe("validerArticle", () => {
  const base = { title: "Un titre suffisamment long", slug: "", description: "", keyword: "", body_md: "", cover_url: "" };
  it("brouillon : titre et adresse suffisent, slug calculé", () => {
    const r = validerArticle(base, "brouillon");
    expect(r.ok).toBe(true);
    expect(r.data.slug).toBe("un-titre-suffisamment-long");
    expect(r.data.description).toBeNull();
  });
  it("refuse un titre trop court et un slug invalide", () => {
    const r = validerArticle({ ...base, title: "Court", slug: "Pas--Bon" }, "brouillon");
    expect(r.erreurs.title).toMatch(/au moins 10/);
    expect(r.erreurs.slug).toMatch(/minuscules/);
  });
  it("refuse un slug réservé par un article fichier", () => {
    const r = validerArticle({ ...base, slug: "guide-cpf" }, "brouillon", ["guide-cpf"]);
    expect(r.erreurs.slug).toMatch(/déjà prise/);
  });
  it("refuse une image sans protocole http(s)", () => {
    expect(validerArticle({ ...base, cover_url: "javascript:alert(1)" }, "brouillon").erreurs.cover_url).toBeTruthy();
    expect(validerArticle({ ...base, cover_url: "https://x.fr/a.jpg" }, "brouillon").data.cover_url).toBe("https://x.fr/a.jpg");
  });
  it("revue : description 140 à 158, mot-clé, 300 mots", () => {
    const r = validerArticle({ ...base, description: "trop court", body_md: mots(10) }, "revue");
    expect(r.erreurs.description).toMatch(/140 et 158/);
    expect(r.erreurs.keyword).toBeTruthy();
    expect(r.erreurs.body_md).toMatch(/300 mots/);
    const ok = validerArticle({ ...base, description: desc, keyword: "formation", body_md: mots(300) }, "revue");
    expect(ok.ok).toBe(true);
    expect(validerArticle({ ...base, description: "d".repeat(159), keyword: "k", body_md: mots(300) }, "revue").erreurs.description).toBeTruthy();
  });
  it("les messages n'utilisent ni tiret cadratin ni demi-cadratin", () => {
    const r = validerArticle({ title: "", slug: "A B", description: "x".repeat(400), keyword: "k".repeat(90), body_md: "", cover_url: "ftp://x" }, "revue");
    for (const m of Object.values(r.erreurs)) expect(m).not.toMatch(/[–—]/);
  });
});

describe("reecrireLiensSortants", () => {
  it("impose ugc noopener sur les liens externes d'un organisme extérieur", () => {
    const html = renderMarkdownSur("[site](https://exemple.fr/page) et [interne](/formations) et [ici](https://annuaire-formation.online/blog)");
    const out = reecrireLiensSortants(html, "ugc", SITE);
    expect(out).toContain('<a href="https://exemple.fr/page" rel="ugc noopener">');
    expect(out).toContain('<a href="/formations">');
    expect(out).toContain('<a href="https://annuaire-formation.online/blog">');
  });
  it("sponsored pour une marque du groupe, et remplace un rel existant", () => {
    const out = reecrireLiensSortants('<a href="http://x.fr" rel="dofollow" target="_blank">x</a>', "sponsored", SITE);
    expect(out).toBe('<a href="http://x.fr" rel="sponsored noopener">x</a>');
  });
  it("neutralise les protocoles dangereux", () => {
    const out = reecrireLiensSortants(renderMarkdownSur("[clic](javascript:alert(1))"), "ugc", SITE);
    expect(out).not.toMatch(/javascript:/i);
  });
  it("garde les mailto et le HTML brut reste échappé", () => {
    const out = reecrireLiensSortants(renderMarkdownSur("[m](mailto:a@b.fr) <script>x</script>"), "ugc", SITE);
    expect(out).toContain('href="mailto:a@b.fr"');
    expect(out).not.toContain("<script>");
  });
  it("relDeLorganisme", () => {
    expect(relDeLorganisme({ is_group: true })).toBe("sponsored");
    expect(relDeLorganisme({ is_group: false, link_rel: "ugc" })).toBe("ugc");
    expect(relDeLorganisme(null)).toBe("ugc");
  });
});

describe("fusionnerBlog", () => {
  const org = (slug: string, published_at: string): OrgPostPublic => ({
    id: slug,
    slug,
    title: `Article ${slug}`,
    seo_title: null,
    description: null,
    keyword: null,
    body_md: "corps",
    cover_url: null,
    published_at,
    updated_at: published_at,
    organizations: { name: "OF", slug: "of", is_group: false, link_rel: "ugc", logo_url: null, website: null },
  });
  const fichier = (slug: string, date: string) => ({ slug, date, title: slug, description: "", image: "", body: "x" });
  it("trie par date et donne la priorité au fichier en cas de collision", () => {
    const out = fusionnerBlog([fichier("a", "2026-10-01"), fichier("commun", "2026-09-01")], [org("commun", "2026-10-20T10:00:00Z"), org("b", "2026-10-15T08:00:00Z")]);
    expect(out.map((e) => `${e.source}:${e.slug}`)).toEqual(["organisme:b", "fichier:a", "fichier:commun"]);
    expect(out[0].date).toBe("2026-10-15");
    expect(out[0].org?.slug).toBe("of");
  });
});

describe("crédits", () => {
  it("peutEnvoyerEnRevue", () => {
    expect(peutEnvoyerEnRevue({ actif: true, groupe: false, soldeCents: 100 })).toBe(true);
    expect(peutEnvoyerEnRevue({ actif: true, groupe: false, soldeCents: 99 })).toBe(false);
    expect(peutEnvoyerEnRevue({ actif: true, groupe: true, soldeCents: 0 })).toBe(true);
    expect(peutEnvoyerEnRevue({ actif: false, groupe: false, soldeCents: null })).toBe(true);
  });
  it("reconnaît l'erreur du trigger", () => {
    expect(estErreurCredit({ code: "P0001", message: "Crédit insuffisant : 1 € est nécessaire pour publier" })).toBe(true);
    expect(estErreurCredit({ code: "23505", message: "duplicate key" })).toBe(false);
  });
  it("formate en euros", () => {
    expect(formaterEuros(500)).toBe("5,00 €");
    expect(formaterEuros(-100)).toBe("-1,00 €");
  });
});
