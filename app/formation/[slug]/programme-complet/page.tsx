import { permanentRedirect } from "next/navigation";

type Params = Promise<{ slug: string }>;

// Le texte complet est désormais sur la fiche elle-même : l'ancienne adresse y renvoie.
export default async function ProgrammeCompletPage({ params }: { params: Params }) {
  const { slug } = await params;
  permanentRedirect(`/formation/${slug}`);
}
