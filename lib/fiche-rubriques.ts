import type { ProgramWithOrg } from "@/lib/types";

export type Rubrique = { id: string; titre: string; texte?: string | null; md?: string | null };

/** Rubriques de la matrice, dans l'ordre des pages sources : texte repris tel quel (version de l'organisme). */
export function rubriquesIntegrales(p: ProgramWithOrg): Rubrique[] {
  const base: Rubrique[] = [
    { id: "points-forts", titre: "Points forts de la formation", texte: p.highlights },
    { id: "modalites", titre: "Modalités pédagogiques", texte: p.modalities_text },
    { id: "programme", titre: "Programme pédagogique", md: p.program_md },
    { id: "resultats", titre: "Résultats attendus", texte: p.results_expected },
    { id: "evaluation", titre: "Modalités d'évaluation", texte: p.evaluation },
    { id: "accessibilite", titre: "Accessibilité", texte: p.accessibility },
    { id: "delais", titre: "Délais d'accès", texte: p.access_delay },
    ...(Array.isArray(p.extra_sections) ? p.extra_sections : []).map((x, i) => ({ id: `autre-${i}`, titre: x.rubrique, texte: x.contenu })),
  ];
  return base.filter((r) => (r.texte && r.texte.trim()) || (r.md && r.md.trim()));
}
