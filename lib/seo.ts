import { modaliteLabel } from "@/lib/spheres";

/** Coupe un texte sur une frontière de mot, sans dépasser `max` caractères (points de suspension inclus). */
export function couper(texte: string, max = 158) {
  const t = texte.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const i = cut.lastIndexOf(" ");
  return `${(i > max * 0.6 ? cut.slice(0, i) : cut).replace(/[\s,;:.!?-]+$/, "")}…`;
}

/** Titre de fiche : « Titre : formation Organisme », raccourci si trop long. */
export function titreFiche(titre: string, organisme: string) {
  const complet = `${titre} : formation ${organisme}`;
  // Le gabarit ajoute « | Annuaire Formation Online » (27 caractères).
  return complet.length <= 62 ? complet : couper(titre, 62);
}

type FicheMetaInput = {
  title: string;
  summary?: string | null;
  duration_text?: string | null;
  price_text?: string | null;
  modality?: string | null;
  city?: string | null;
  cpf_eligible?: boolean;
  certification?: string | null;
  organizations: { name: string };
};

/**
 * Description de fiche : les faits comparables d'abord (ce que cherche l'internaute),
 * puis le début du résumé. Toujours ≤ 158 caractères, coupée sur un mot.
 */
export function descriptionFiche(p: FicheMetaInput & { meta_description?: string | null }) {
  if (p.meta_description && p.meta_description.trim()) return p.meta_description.trim();
  const faits = [
    p.duration_text?.trim(),
    p.modality ? modaliteLabel(p.modality).toLowerCase() : null,
    p.city && p.modality !== "distanciel" ? p.city : null,
    p.certification ? `certifiant ${p.certification}` : null,
    p.cpf_eligible ? "éligible CPF" : null,
  ].filter(Boolean);
  const tete = `Formation ${p.title} par ${p.organizations.name}${faits.length ? ` : ${faits.join(", ")}` : ""}.`;
  const suite = p.summary ? ` ${p.summary}` : " Objectifs, public, prérequis, prix et contact de l'organisme.";
  return couper(tete + suite, 158);
}

/**
 * Durée au format ISO 8601 pour schema.org (courseWorkload), seulement si le texte
 * commence par un nombre d'heures exact (« 30 heures », « 21h (3 jours) »).
 * « À partir de 7h » ou « 3 jours » → null : on n'invente pas de durée.
 */
export function dureeIso(texte?: string | null): string | null {
  if (!texte) return null;
  const m = texte.trim().match(/^(\d{1,4})\s*(?:h|heures?)\b/i);
  return m ? `PT${parseInt(m[1], 10)}H` : null;
}
