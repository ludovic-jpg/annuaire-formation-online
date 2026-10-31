/** Crédits de publication (migration 0005) : logique pure. */

export const PRIX_PUBLICATION_CENTS = 100;
export const BIENVENUE_CENTS = 500;
export const MESSAGE_RECHARGE = "La recharge en ligne arrive bientôt : écrivez à contact@annuaire-formation.online";

export type LigneCredit = { id: string; amount_cents: number; reason: string; created_at: string };

export type Credit = {
  /** false si la migration n'est pas encore appliquée (fonction ou table absente) : rien n'est bloqué. */
  actif: boolean;
  groupe: boolean;
  soldeCents: number | null;
  historique: LigneCredit[];
};

export const MOTIFS_CREDIT: Record<string, string> = {
  bienvenue: "Crédit de bienvenue",
  publication_fiche: "Publication d'une fiche",
  publication_article: "Publication d'un article",
  recharge: "Recharge",
  ajustement: "Ajustement",
};

export function formaterEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100).replace(/ | /g, " ");
}

/** Envoi en revue autorisé : marque du groupe, crédit inactif (migration absente) ou solde d'au moins 1 €. */
export function peutEnvoyerEnRevue(c: Pick<Credit, "actif" | "groupe" | "soldeCents"> | null | undefined): boolean {
  if (!c || !c.actif || c.groupe) return true;
  return (c.soldeCents ?? 0) >= PRIX_PUBLICATION_CENTS;
}

/** Erreur levée par le trigger credit_on_status (« Crédit insuffisant… », code P0001). */
export function estErreurCredit(e: { code?: string | null; message?: string | null } | null | undefined): boolean {
  if (!e) return false;
  return /cr[ée]dit insuffisant/i.test(e.message ?? "") || (e.code === "P0001" && /cr[ée]dit/i.test(e.message ?? ""));
}

export function messageErreurCredit(): string {
  return `Crédit insuffisant : 1 € est nécessaire pour envoyer en revue. ${MESSAGE_RECHARGE}.`;
}
