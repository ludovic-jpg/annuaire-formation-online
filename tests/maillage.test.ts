import { describe, expect, it } from "vitest";
import { articlesLiesAFiche, fichesLieesAArticle } from "@/lib/maillage";

const A = [
  { slug: "lire-bilan", title: "Lire un bilan et un compte de résultat", keyword: "comptabilité", org: "formacompta" },
  { slug: "prendre-la-parole", title: "Prendre la parole en public", keyword: "prise de parole", org: "back-to-business-formatrix" },
];

describe("maillage fiches ⇄ articles", () => {
  it("relie une fiche et un article qui partagent un mot-clé, même sans même organisme", () => {
    const r = articlesLiesAFiche({ title: "Comptabilité générale : des écritures au bilan", orgSlug: "autre", nbFichesOrg: 50 }, A);
    expect(r.map((x) => x.slug)).toEqual(["lire-bilan"]);
  });
  it("ne relie pas un article de grosse marque à toutes ses fiches sans rapport", () => {
    const r = articlesLiesAFiche({ title: "Excel avancé", orgSlug: "back-to-business-formatrix", nbFichesOrg: 68 }, A);
    expect(r).toEqual([]);
  });
  it("relie par marque quand la marque est petite", () => {
    const r = articlesLiesAFiche({ title: "Tenue de caisse", orgSlug: "formacompta", nbFichesOrg: 6 }, A);
    expect(r.map((x) => x.slug)).toEqual(["lire-bilan"]);
  });
  it("sens inverse : fiches liées à un article", () => {
    const r = fichesLieesAArticle(A[1], [
      { slug: "parole", title: "Parler en public avec aisance", orgSlug: "x", nbFichesOrg: 3 },
      { slug: "excel", title: "Excel avancé", orgSlug: "x", nbFichesOrg: 3 },
    ]);
    expect(r.map((x) => x.slug)).toEqual(["parole"]);
  });
});
