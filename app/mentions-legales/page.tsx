import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Mentions légales", alternates: { canonical: "/mentions-legales" } };

export default function MentionsPage() {
  return (
    <LegalPage title="Mentions légales" updated="31 octobre 2026">
      <h2>Éditeur</h2>
      <p>
        Back to Business, société par actions simplifiée unipersonnelle (SASU), nom commercial Formatrix.
        <br />Siège social : 91 Grand Rue Pierre Braun, 68170 Rixheim, France.
        <br />SIREN, RCS et capital social : à compléter.
        <br />Contact : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
      <p>Directeur de la publication : Ludovic Albisser, président.</p>

      <h2>Hébergement</h2>
      <p>
        Application : Hostinger International Ltd, 61 Lordou Vironos Street, 6023 Larnaca, Chypre (serveur situé dans l&apos;Union
        européenne).
        <br />Base de données et authentification : Supabase Inc., 970 Toa Payoh North #07-04, Singapour 318992, données hébergées dans
        une région de l&apos;Union européenne.
      </p>

      <h2>Contenus publiés par les organismes</h2>
      <p>
        Les fiches sont rédigées par les organismes de formation, qui en sont responsables. L&apos;éditeur agit en qualité
        d&apos;hébergeur au sens du règlement (UE) 2022/2065 (DSA). Pour signaler un contenu illicite, écrivez à{" "}
        <a href={`mailto:${CONTACT_EMAIL}?subject=Signalement`}>{CONTACT_EMAIL}</a> en indiquant l&apos;adresse de la page et le motif.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La structure du site, ses textes éditoriaux et ses éléments graphiques sont la propriété de Back to Business. Les logos et
        marques des organismes appartiennent à leurs titulaires respectifs.
      </p>
    </LegalPage>
  );
}
