import { SITE_URL, CONTACT_EMAIL } from "@/lib/env";
import { SPHERES, modaliteLabel } from "@/lib/spheres";
import { allPublishedLight, activeOrganizationsLight } from "@/lib/data";
import { THEMES_CONTENU } from "@/lib/contenu/themes";

export const revalidate = 300;

/**
 * llms.txt (proposition llmstxt.org) : résumé du site pour les assistants conversationnels.
 * Format court et factuel. Ne liste que les fiches et organismes indexables (cohérent avec le sitemap) ;
 * les pages thème sont listées pour leur guide éditorial.
 */
export async function GET() {
  const [all, orgs] = await Promise.all([allPublishedLight(), activeOrganizationsLight()]);
  const programs = all.filter((p) => p.indexable);
  const orgIds = new Set(programs.map((p) => p.org_id));
  const orgsIdx = orgs.filter((o) => orgIds.has(o.id));
  const orgName = new Map(orgs.map((o) => [o.id, o.name]));

  const fiche = (p: (typeof programs)[number]) => {
    const faits = [
      orgName.get(p.org_id),
      p.duration_text,
      p.modality ? modaliteLabel(p.modality).toLowerCase() : null,
      p.city,
      p.certification ? `certifiant ${p.certification}` : null,
      p.cpf_eligible ? "éligible CPF" : null,
    ].filter(Boolean);
    return `- [${p.title}](${SITE_URL}/formation/${p.slug}) : ${faits.join(", ")}`;
  };

  const lines = [
    "# Annuaire Formation Online",
    "",
    "> Annuaire français de parcours de formation professionnelle. Chaque fiche décrit un parcours réel avec les mêmes champs : organisme, durée, prix, modalité (présentiel, à distance, mixte), ville, éligibilité CPF, certification préparée, objectifs, public visé et prérequis. Édité par Back to Business SASU (nom commercial Formatrix), organisme de formation à Rixheim (68) ; les parcours des marques de l'éditeur sont signalés comme tels et ne sont pas favorisés.",
    "",
    "Les informations des fiches sont déclarées par les organismes et relues avant publication. Le programme détaillé, les dates et l'inscription sont sur le site de chaque organisme (lien sur la fiche). Classement : pertinence, puis complétude de la fiche, puis date de publication ; aucune option payante. L'annuaire ne publie pas d'avis.",
    "",
    `Contact : ${CONTACT_EMAIL}`,
    "",
    "## Pages de référence",
    `- [À propos et méthodologie](${SITE_URL}/a-propos) : éditeur, contenu d'une fiche, relecture, indexation, liens`,
    `- [Comment fonctionne le classement](${SITE_URL}/comment-fonctionne-le-classement) : critères de tri et liens avec l'éditeur`,
    `- [Rechercher une formation](${SITE_URL}/formations) : recherche par mot-clé, thème, ville, modalité, CPF, certification`,
    `- [Publier ses formations](${SITE_URL}/publier) : référencement gratuit pour les organismes de formation`,
    "",
    "## Thèmes (guide pour bien choisir + parcours référencés)",
    ...SPHERES.map((s) => `- [${THEMES_CONTENU[s.slug]?.h1 ?? s.label}](${SITE_URL}/theme/${s.slug}) : ${THEMES_CONTENU[s.slug]?.accroche ?? s.intro}`),
    "",
  ];
  if (orgsIdx.length) {
    lines.push("## Organismes", ...orgsIdx.map((o) => `- [${o.name}](${SITE_URL}/organisme/${o.slug})`), "");
  }
  if (programs.length) {
    lines.push("## Parcours", ...programs.slice(0, 500).map(fiche), "");
  }
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
