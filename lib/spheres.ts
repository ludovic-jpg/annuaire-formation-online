export type Sphere = {
  slug: string;
  label: string;
  short: string;
  intro: string;
  color: string;
};

export const SPHERES: Sphere[] = [
  { slug: "digital-bureautique", label: "Digital & bureautique", short: "Digital", color: "#2F5BFF",
    intro: "Bureautique, outils collaboratifs, IA au quotidien, marketing digital : des parcours pour gagner en aisance sur les outils qui structurent le travail." },
  { slug: "management-rh", label: "Management & RH", short: "Management", color: "#14206B",
    intro: "Encadrer une équipe, recruter, conduire un entretien, piloter un projet : des parcours pour celles et ceux qui animent des collectifs." },
  { slug: "langues", label: "Langues", short: "Langues", color: "#FFCD1C",
    intro: "Anglais, allemand, espagnol, français langue étrangère : des parcours à l'oral comme à l'écrit, souvent certifiants (LILATE)." },
  { slug: "bien-etre-massage", label: "Bien-être & massage", short: "Bien-être", color: "#FF8FB1",
    intro: "Massage, yoga, sophrologie, accompagnement : des parcours pour exercer ou enrichir une pratique du soin et du bien-être." },
  { slug: "vente-commerce", label: "Vente & commerce", short: "Vente", color: "#16C79A",
    intro: "Prospection, négociation, relation client, vente en ligne : des parcours pour vendre mieux et fidéliser." },
  { slug: "comptabilite-finance", label: "Comptabilité & finance", short: "Compta", color: "#7B61FF",
    intro: "Tenue comptable, gestion, paie, lecture d'un bilan : des parcours pour fiabiliser les chiffres d'une structure." },
  { slug: "metiers-specifiques", label: "Métiers spécifiques", short: "Métiers", color: "#FF6B3D",
    intro: "Des parcours ciblés sur des métiers précis, de l'artisanat aux fonctions techniques." },
  { slug: "rse-culture", label: "RSE & culture", short: "RSE", color: "#3DBE5B",
    intro: "Responsabilité sociétale, écoconception, culture générale et ouverture : des parcours pour agir et comprendre." },
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
