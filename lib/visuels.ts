/** Visuels rapatriés des sites du groupe (public/visuels). */
export const SPHERE_VISUELS: Record<string, string> = {
  "digital-bureautique": "/visuels/hero-formadigital-accueil.webp",
  "management-rh": "/visuels/hero-formarh-collaboration.webp",
  langues: "/visuels/hero-formalangue-accueil.webp",
  "bien-etre-massage": "/visuels/hero-formabienetre-wellness.webp",
  "vente-commerce": "/visuels/illus-formavente-vendeurs-duo.webp",
  "comptabilite-finance": "/visuels/og-formacompta.webp",
  "metiers-specifiques": "/visuels/hero-formatrix-formation.webp",
  "rse-culture": "/visuels/hero-skills4mation-accueil.webp",
  "bilan-de-competences": "/visuels/og-bilandecompetence.webp",
};

export const HERO_VISUEL = "/visuels/hero-formatrix-formation.webp";

export const LOGOS_GROUPE = [
  { name: "Formatrix", src: "/visuels/logo-formatrix.webp", w: 800, h: 142 },
  { name: "Skills4mation", src: "/visuels/logo-skills4mation.webp", w: 469, h: 61 },
  { name: "FormaRH", src: "/visuels/logo-formarh.webp", w: 112, h: 112 },
  { name: "FormaLangue", src: "/visuels/logo-formalangue.webp", w: 400, h: 400 },
  { name: "FormaDigital", src: "/visuels/logo-formadigital.webp", w: 397, h: 449 },
  { name: "FormaVente", src: "/visuels/logo-formavente.webp", w: 500, h: 500 },
  { name: "FormaBienêtre", src: "/visuels/logo-formabienetre.webp", w: 96, h: 96 },
  { name: "FormaCompta", src: "/visuels/logo-formacompta.webp", w: 112, h: 112 },
  { name: "Bilan de compétence", src: "/visuels/logo-bilandecompetence.webp", w: 192, h: 192 },
];

export function programImage(p: { image_url?: string | null; sphere?: string | null }) {
  if (p.image_url) return p.image_url;
  return (p.sphere && SPHERE_VISUELS[p.sphere]) || HERO_VISUEL;
}
