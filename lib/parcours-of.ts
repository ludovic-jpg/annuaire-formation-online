/** Les 5 étapes du parcours d'un organisme (mêmes intitulés que la page /publier). */
export type EtapeEtat = "fait" | "en-cours" | "a-venir";
export type Etape = { titre: string; etat: EtapeEtat; detail: string; href?: string; action?: string };

export function etapesOrganisme(input: {
  orgStatus: "pending" | "active" | "rejected" | null;
  programs: { status: string; completeness: number }[];
  contacts: number;
}): Etape[] {
  const { orgStatus, programs, contacts } = input;
  const hasOrg = orgStatus !== null;
  const drafts = programs.filter((p) => p.status === "draft" || p.status === "rejected");
  const pending = programs.some((p) => p.status === "pending");
  const published = programs.some((p) => p.status === "published");
  const sent = pending || published;

  const etapes: Etape[] = [
    { titre: "Connexion", etat: "fait", detail: "Compte créé" },
    {
      titre: "Organisme",
      etat: hasOrg ? "fait" : "en-cours",
      detail: !hasOrg ? "À renseigner" : orgStatus === "active" ? "Vérifié" : orgStatus === "pending" ? "En vérification" : "Refusé, contactez-nous",
      href: "/espace/organisme",
      action: hasOrg ? undefined : "Renseigner mon organisme",
    },
    {
      titre: "Fiche",
      etat: sent ? "fait" : hasOrg ? "en-cours" : "a-venir",
      detail: sent
        ? `${programs.length} fiche${programs.length > 1 ? "s" : ""}`
        : drafts.length
          ? `Brouillon à ${Math.max(...drafts.map((d) => d.completeness))} %`
          : "Aucune fiche",
      href: drafts.length ? undefined : "/espace/fiche/nouvelle",
      action: hasOrg && !programs.length ? "Créer ma première fiche" : undefined,
    },
    {
      titre: "Revue",
      etat: published ? "fait" : pending ? "en-cours" : "a-venir",
      detail: published ? "Validée" : pending ? "Relecture sous 2 jours ouvrés" : "Après l'envoi",
    },
    {
      titre: "Demandes",
      etat: contacts > 0 ? "fait" : published ? "en-cours" : "a-venir",
      detail: contacts > 0 ? `${contacts} reçue${contacts > 1 ? "s" : ""}` : published ? "Fiche en ligne, en attente" : "Une fois publiée",
    },
  ];
  return etapes;
}
