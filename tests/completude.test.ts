import { describe, expect, it } from "vitest";
import { canSubmit, computeCompleteness, countWords } from "@/lib/completude";

const words = (n: number) => Array.from({ length: n }, (_, i) => `mot${i}`).join(" ");

describe("countWords", () => {
  it("compte les mots français avec apostrophes et tirets", () => {
    expect(countWords("L'apprenant met en œuvre un tableau croisé-dynamique")).toBe(7);
    expect(countWords("")).toBe(0);
    expect(countWords(null)).toBe(0);
  });
});

describe("computeCompleteness", () => {
  it("vaut 0 pour une fiche vide", () => {
    expect(computeCompleteness({}).score).toBe(0);
  });

  it("vaut 100 pour une fiche complète", () => {
    const { score } = computeCompleteness({
      title: "Excel perfectionnement",
      summary: words(100),
      objectives: ["Créer un TCD", "Automatiser", "Visualiser"],
      audience: "Assistants",
      prerequisites: "Aucun",
      duration_text: "14 h",
      price_text: "690 €",
      modality: "distanciel",
      sphere: "digital-bureautique",
      source_url: "https://formatrix.fr/excel",
    });
    expect(score).toBe(100);
  });

  it("donne une note partielle au résumé trop court et sanctionne le résumé trop long", () => {
    const short = computeCompleteness({ summary: words(50) }).items.find((i) => i.key === "summary")!;
    const long = computeCompleteness({ summary: words(200) }).items.find((i) => i.key === "summary")!;
    const ok = computeCompleteness({ summary: words(80) }).items.find((i) => i.key === "summary")!;
    expect(short.earned).toBe(10);
    expect(ok.earned).toBe(20);
    expect(long.earned).toBe(10);
  });

  it("exige une ville sauf à distance", () => {
    const pres = computeCompleteness({ modality: "presentiel" }).items.find((i) => i.key === "place")!;
    const dist = computeCompleteness({ modality: "distanciel" }).items.find((i) => i.key === "place")!;
    expect(pres.earned).toBe(0);
    expect(dist.earned).toBe(4);
  });
});

describe("canSubmit", () => {
  it("refuse un résumé hors bornes", () => {
    const r = canSubmit({ title: "Titre assez long", summary: words(20), objectives: ["x y z"], sphere: "langues", modality: "mixte", source_url: "https://a.fr" });
    expect(r.ok).toBe(false);
    expect(r.errors.join(" ")).toMatch(/résumé/);
  });
  it("accepte une fiche minimale correcte", () => {
    const r = canSubmit({ title: "Titre assez long", summary: words(90), objectives: ["Parler"], sphere: "langues", modality: "mixte", source_url: "https://a.fr/p" });
    expect(r.ok).toBe(true);
  });
});
