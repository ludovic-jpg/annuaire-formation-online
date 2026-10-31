import { describe, expect, it } from "vitest";
import { THEMES_CONTENU, compterMots } from "@/lib/contenu/themes";
import { META, PUBLIER, ACCUEIL_FAQ, ACCUEIL_GUIDE, FORMATIONS_INTRO } from "@/lib/contenu/pages";
import { SPHERES } from "@/lib/spheres";
import { couper, descriptionFiche, dureeIso, titreFiche } from "@/lib/seo";

const tousLesTextes = () => {
  const out: string[] = [FORMATIONS_INTRO, ACCUEIL_GUIDE.titre];
  for (const c of Object.values(THEMES_CONTENU)) out.push(c.metaTitle, c.metaDescription, c.h1, c.accroche, c.titreGuide, ...c.guide, ...c.faq.flatMap((f) => [f.q, f.r]));
  for (const m of Object.values(META)) out.push(m.title, m.description);
  out.push(PUBLIER.h1, PUBLIER.chapo, ...PUBLIER.pourquoi.paragraphes, ...PUBLIER.faq.flatMap((f) => [f.q, f.r]));
  out.push(...ACCUEIL_FAQ.flatMap((f) => [f.q, f.r]), ...ACCUEIL_GUIDE.apprenants.paragraphes, ...ACCUEIL_GUIDE.organismes.paragraphes);
  return out;
};

describe("contenus éditoriaux des thèmes", () => {
  it("couvrent les 9 sphères", () => {
    for (const s of SPHERES) expect(THEMES_CONTENU[s.slug], s.slug).toBeDefined();
  });
  it.each(SPHERES.map((s) => s.slug))("%s : guide de 150 à 250 mots, 3 à 5 questions, voisins valides", (slug) => {
    const c = THEMES_CONTENU[slug];
    const mots = compterMots(c.guide.join(" "));
    expect(mots).toBeGreaterThanOrEqual(150);
    expect(mots).toBeLessThanOrEqual(250);
    expect(c.faq.length).toBeGreaterThanOrEqual(3);
    expect(c.faq.length).toBeLessThanOrEqual(5);
    for (const v of c.voisins) expect(THEMES_CONTENU[v]).toBeDefined();
  });
  it("titres et descriptions uniques et de longueur raisonnable", () => {
    const titles = Object.values(THEMES_CONTENU).map((c) => c.metaTitle).concat(Object.values(META).map((m) => m.title));
    const descs = Object.values(THEMES_CONTENU).map((c) => c.metaDescription).concat(Object.values(META).map((m) => m.description));
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descs).size).toBe(descs.length);
    for (const d of descs) {
      expect(d.length, d).toBeGreaterThanOrEqual(110);
      expect(d.length, d).toBeLessThanOrEqual(160);
    }
    for (const t of titles) expect(t.length, t).toBeLessThanOrEqual(72);
  });
  it("aucun tiret cadratin ni demi-cadratin", () => {
    for (const t of tousLesTextes()) expect(t, t).not.toMatch(/[—–]/);
  });
});

describe("helpers SEO", () => {
  it("couper respecte la limite et coupe sur un mot", () => {
    const r = couper("un deux trois quatre cinq six sept huit neuf dix", 20);
    expect(r.length).toBeLessThanOrEqual(20);
    expect(r.endsWith("…")).toBe(true);
    expect(couper("court", 20)).toBe("court");
  });
  it("dureeIso ne convertit que les heures exactes", () => {
    expect(dureeIso("30 heures")).toBe("PT30H");
    expect(dureeIso("21h (3 jours)")).toBe("PT21H");
    expect(dureeIso("À partir de 7h")).toBeNull();
    expect(dureeIso("3 jours")).toBeNull();
    expect(dureeIso(null)).toBeNull();
  });
  it("titreFiche raccourcit les titres longs", () => {
    expect(titreFiche("Massage Lomi", "FormaBienêtre")).toBe("Massage Lomi : formation FormaBienêtre");
    expect(titreFiche("Un titre de parcours vraiment très long pour tenir dans la limite", "Organisme").length).toBeLessThanOrEqual(62);
  });
  it("descriptionFiche met les faits en tête et reste ≤ 158 caractères", () => {
    const d = descriptionFiche({
      title: "Anglais des affaires",
      summary: "Un long résumé ".repeat(20),
      duration_text: "30 heures",
      modality: "mixte",
      city: null,
      cpf_eligible: true,
      certification: "LILATE",
      organizations: { name: "FormaLangue" },
    });
    expect(d.startsWith("Formation Anglais des affaires par FormaLangue : 30 heures, mixte, certifiant LILATE, éligible CPF.")).toBe(true);
    expect(d.length).toBeLessThanOrEqual(158);
  });
});
