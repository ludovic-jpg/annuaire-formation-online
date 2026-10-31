import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Politique de confidentialité", alternates: { canonical: "/confidentialite" } };

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="31 octobre 2026">
      <p>Responsable du traitement : Back to Business SASU (Formatrix), 91 Grand Rue Pierre Braun, 68170 Rixheim. Contact : {CONTACT_EMAIL}.</p>
      <h2>Données traitées</h2>
      <ul>
        <li><strong>Comptes organismes</strong> : adresse e-mail, informations de l&apos;organisme. Finalité : gestion du compte et des fiches. Base : exécution du contrat (CGU). Conservation : durée du compte puis 3 ans.</li>
        <li><strong>Demandes de contact</strong> : nom, e-mail, message. Finalité : transmission à l&apos;organisme choisi. Base : votre demande. Conservation : 3 ans.</li>
        <li><strong>Liste d&apos;attente</strong> : e-mail et informations facultatives. Finalité : vous prévenir de l&apos;ouverture. Base : consentement. Conservation : jusqu&apos;à désinscription, au plus 3 ans.</li>
        <li><strong>Données professionnelles publiées</strong> : nom de l&apos;organisme, SIRET, déclaration d&apos;activité, ville. Base : intérêt légitime (information du public sur l&apos;offre de formation).</li>
      </ul>
      <h2>Destinataires et hébergement</h2>
      <p>
        Les données sont hébergées dans l&apos;Union européenne par nos sous-traitants Hostinger (application) et Supabase (base de
        données, authentification). Les demandes de contact sont transmises au seul organisme concerné. Aucune donnée n&apos;est vendue.
      </p>
      <h2>Cookies</h2>
      <p>
        Le site n&apos;utilise que des cookies strictement nécessaires (session de l&apos;espace organisme). Aucun cookie publicitaire ni
        de mesure d&apos;audience tierce : aucun bandeau de consentement n&apos;est donc requis.
      </p>
      <h2>Vos droits</h2>
      <p>
        Vous disposez des droits d&apos;accès, de rectification, d&apos;effacement, de limitation, de portabilité et d&apos;opposition. Les
        organismes peuvent s&apos;opposer à la présence de leurs informations dans l&apos;annuaire. Écrivez à {CONTACT_EMAIL}. Vous pouvez
        aussi saisir la CNIL (cnil.fr).
      </p>
    </LegalPage>
  );
}
