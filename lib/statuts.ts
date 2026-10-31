export const STATUTS: Record<string, { label: string; className: string; help: string }> = {
  draft: { label: "Brouillon", className: "bg-slate-100 text-encre", help: "Visible par vous seul. Complétez-la puis envoyez-la en revue." },
  pending: { label: "En revue", className: "bg-jaune-pale text-encre", help: "Nous relisons votre fiche, en général sous 2 jours ouvrés." },
  published: { label: "Publiée", className: "bg-menthe/25 text-encre", help: "En ligne dans l'annuaire." },
  rejected: { label: "Refusée", className: "bg-red-100 text-red-900", help: "Corrigez selon le motif puis renvoyez-la en revue." },
};
export const STEPS = ["draft", "pending", "published"] as const;
