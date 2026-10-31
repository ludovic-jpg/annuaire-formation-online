import { SITE_URL, CONTACT_EMAIL } from "@/lib/env";
import { SPHERES } from "@/lib/spheres";
import { allPublishedLight } from "@/lib/data";

export const revalidate = 300;

export async function GET() {
  const programs = (await allPublishedLight()).filter((p) => p.indexable);
  const lines = [
    "# Annuaire Formation Online",
    "",
    "> Annuaire français de parcours de formation professionnelle. Chaque fiche décrit un parcours (durée, prix, modalité, éligibilité CPF, objectifs) et l'organisme qui le propose. Édité par Back to Business SASU (Formatrix), Rixheim ; les offres des marques de l'éditeur sont signalées comme telles.",
    "",
    `Contact : ${CONTACT_EMAIL}`,
    "",
    "## Pages clés",
    `- [Toutes les formations](${SITE_URL}/formations) : recherche et filtres`,
    `- [Comment fonctionne le classement](${SITE_URL}/comment-fonctionne-le-classement) : critères de tri et liens avec l'éditeur`,
    `- [Publier mes parcours](${SITE_URL}/publier) : pour les organismes de formation`,
    "",
    "## Thèmes",
    ...SPHERES.map((s) => `- [${s.label}](${SITE_URL}/theme/${s.slug}) : ${s.intro}`),
    "",
    "## Parcours",
    ...programs.slice(0, 500).map((p) => `- [${p.title}](${SITE_URL}/formation/${p.slug})${p.city ? ` (${p.city})` : ""}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
