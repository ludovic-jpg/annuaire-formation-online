export type Sphere = {
  slug: string;
  label: string;
  short: string;
  intro: string;
  color: string;
};

export const SPHERES: Sphere[] = [
  { slug: "digital-bureautique", label: "Digital & bureautique", short: "Digital", color: "#2F5BFF",
    intro: "Tableurs, traitement de texte, outils collaboratifs, IA, référencement, réseaux sociaux : des parcours pour gagner en aisance sur les outils numériques." },
  { slug: "management-rh", label: "Management & RH", short: "Management", color: "#14206B",
    intro: "Encadrer, recruter, gérer les priorités et les tensions, piloter un projet : des parcours pour celles et ceux qui animent un collectif." },
  { slug: "langues", label: "Langues", short: "Langues", color: "#FFCD1C",
    intro: "Anglais, allemand, espagnol, italien, portugais, japonais, mandarin et français professionnel : à l'oral comme à l'écrit." },
  { slug: "bien-etre-massage", label: "Bien-être & massage", short: "Bien-être", color: "#FF8FB1",
    intro: "Massages du monde, massage assis, pierres chaudes, yoga et ayurveda : des parcours pour exercer ou enrichir une pratique du bien-être." },
  { slug: "vente-commerce", label: "Vente & commerce", short: "Vente", color: "#16C79A",
    intro: "Prospection, vente conseil, closing, grands comptes, plan d'action commercial, vente en magasin : des parcours pour vendre mieux." },
  { slug: "comptabilite-finance", label: "Comptabilité & finance", short: "Compta", color: "#7B61FF",
    intro: "Comptabilité générale, paie, fiscalité, analyse financière, audit, pilotage de TPE : des parcours pour fiabiliser les chiffres." },
  { slug: "metiers-specifiques", label: "Métiers spécifiques", short: "Métiers", color: "#FF6B3D",
    intro: "Des parcours ciblés sur des métiers précis, de l'artisanat aux fonctions techniques." },
  { slug: "rse-culture", label: "RSE & culture", short: "RSE", color: "#3DBE5B",
    intro: "Empreinte carbone, économie circulaire, mécénat d'entreprise : des parcours pour passer de l'intention aux actions." },
  { slug: "bilan-de-competences", label: "Bilan de compétences", short: "Bilan", color: "#00B3D7",
    intro: "Faire le point sur son parcours, ses envies et ses compétences pour construire un projet professionnel." },
];

export const SPHERE_BY_SLUG = Object.fromEntries(SPHERES.map((s) => [s.slug, s])) as Record<string, Sphere>;

export function sphereLabel(slug?: string | null) {
  return (slug && SPHERE_BY_SLUG[slug]?.label) || "Autre";
}

export const MODALITES = [
  { value: "presentiel", label: "Présentiel" },
  { value: "distanciel", label: "À distance" },
  { value: "mixte", label: "Mixte" },
] as const;

export function modaliteLabel(v?: string | null) {
  return MODALITES.find((m) => m.value === v)?.label ?? "Non précisé";
}

export const CERTIFICATIONS = ["LILATE", "ICDL"] as const;
