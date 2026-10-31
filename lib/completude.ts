export type CompletenessInput = {
  title?: string | null;
  summary?: string | null;
  objectives?: (string | null)[] | null;
  audience?: string | null;
  prerequisites?: string | null;
  duration_text?: string | null;
  price_text?: string | null;
  modality?: string | null;
  sphere?: string | null;
  city?: string | null;
  source_url?: string | null;
};

export type CompletenessItem = { key: string; label: string; points: number; earned: number; hint: string };

export const SUMMARY_MIN_WORDS = 80;
export const SUMMARY_MAX_WORDS = 150;

export function countWords(text?: string | null): number {
  if (!text) return 0;
  const m = text.trim().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return m ? m.length : 0;
}

const filled = (v?: string | null, min = 2) => Boolean(v && v.trim().length >= min);

export function computeCompleteness(p: CompletenessInput): { score: number; items: CompletenessItem[] } {
  const words = countWords(p.summary);
  const objectives = (p.objectives ?? []).filter((o) => filled(o, 3));
  const summaryEarned = words >= SUMMARY_MIN_WORDS && words <= SUMMARY_MAX_WORDS ? 20 : words >= 40 ? 10 : 0;
  const objEarned = objectives.length >= 3 ? 15 : objectives.length >= 1 ? 7 : 0;
  const placeOk = p.modality === "distanciel" || filled(p.city);

  const items: CompletenessItem[] = [
    { key: "title", label: "Titre clair", points: 10, earned: filled(p.title, 8) ? 10 : 0, hint: "Un titre d'au moins 8 caractères qui dit ce qu'on apprend." },
    { key: "summary", label: "Résumé de 80 à 150 mots", points: 20, earned: summaryEarned, hint: `Résumé original de ${SUMMARY_MIN_WORDS} à ${SUMMARY_MAX_WORDS} mots (actuellement ${words}).` },
    { key: "objectives", label: "3 objectifs ou plus", points: 15, earned: objEarned, hint: "Des objectifs évaluables, un par ligne." },
    { key: "audience", label: "Public visé", points: 8, earned: filled(p.audience, 3) ? 8 : 0, hint: "À qui s'adresse le parcours ?" },
    { key: "prerequisites", label: "Prérequis", points: 7, earned: filled(p.prerequisites, 3) ? 7 : 0, hint: "Écrivez « Aucun » s'il n'y en a pas." },
    { key: "duration", label: "Durée", points: 8, earned: filled(p.duration_text) ? 8 : 0, hint: "Par exemple : 35 heures sur 5 semaines." },
    { key: "price", label: "Prix", points: 8, earned: filled(p.price_text) ? 8 : 0, hint: "Prix ou « sur devis »." },
    { key: "modality", label: "Modalité", points: 6, earned: p.modality ? 6 : 0, hint: "Présentiel, à distance ou mixte." },
    { key: "sphere", label: "Thème", points: 6, earned: p.sphere ? 6 : 0, hint: "Le thème aide les apprenants à vous trouver." },
    { key: "place", label: "Ville", points: 4, earned: placeOk ? 4 : 0, hint: "Ville du présentiel (facultatif à distance)." },
    { key: "source", label: "Lien vers votre site", points: 8, earned: /^https?:\/\/\S+\.\S+/.test(p.source_url ?? "") ? 8 : 0, hint: "La page du parcours sur votre site." },
  ];
  const score = items.reduce((s, i) => s + i.earned, 0);
  return { score: Math.min(100, score), items };
}

/** Conditions minimales pour envoyer en revue. */
export function canSubmit(p: CompletenessInput) {
  const words = countWords(p.summary);
  const errors: string[] = [];
  if (!filled(p.title, 8)) errors.push("Le titre doit faire au moins 8 caractères.");
  if (words < SUMMARY_MIN_WORDS || words > SUMMARY_MAX_WORDS)
    errors.push(`Le résumé doit faire entre ${SUMMARY_MIN_WORDS} et ${SUMMARY_MAX_WORDS} mots (actuellement ${words}).`);
  if ((p.objectives ?? []).filter((o) => filled(o, 3)).length < 1) errors.push("Ajoutez au moins un objectif.");
  if (!p.sphere) errors.push("Choisissez un thème.");
  if (!p.modality) errors.push("Choisissez une modalité.");
  if (!/^https?:\/\/\S+\.\S+/.test(p.source_url ?? "")) errors.push("Indiquez l'adresse de la page du parcours sur votre site.");
  return { ok: errors.length === 0, errors };
}
