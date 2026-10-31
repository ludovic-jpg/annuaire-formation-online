import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Conditions générales d'utilisation", alternates: { canonical: "/cgu" } };

export default function CguPage() {
  return (
    <LegalPage title="Conditions générales d'utilisation" updated="31 octobre 2026">
      <p>
        Ces conditions encadrent l&apos;usage d&apos;Annuaire Formation Online par les visiteurs et par les organismes de formation qui
        publient des fiches. Elles sont soumises au droit français.
      </p>
      <h2>1. Service</h2>
      <p>
        L&apos;annuaire permet de consulter des parcours de formation et de contacter les organismes qui les proposent. Il est gratuit
        pour les visiteurs. Pour les organismes, 5 € de crédit sont offerts à l&apos;inscription, puis chaque fiche ou article publié coûte 1 €.
      </p>
      <h2>2. Compte organisme</h2>
      <ul>
        <li>Le compte est créé par connexion avec une adresse e-mail. L&apos;organisme garantit l&apos;exactitude des informations saisies (SIRET, déclaration d&apos;activité, Qualiopi).</li>
        <li>L&apos;organisme reste responsable du contenu de ses fiches, qui doit être exact, à jour et conforme à la réglementation de la formation professionnelle, notamment au référentiel Qualiopi (information du public).</li>
        <li>Le résumé de chaque fiche doit être original. Les mentions de certification (certificateur, type de reconnaissance) doivent être exactes.</li>
      </ul>
      <h2>3. Relecture, refus et retrait</h2>
      <p>
        Chaque fiche est relue avant publication. Tout refus, suspension ou retrait est motivé par écrit dans l&apos;espace de
        l&apos;organisme. Une résiliation du compte à l&apos;initiative de l&apos;éditeur est notifiée avec un préavis de 30 jours, sauf
        manquement grave ou obligation légale. Les critères de classement sont décrits sur la page{" "}
        <Link href="/comment-fonctionne-le-classement">Comment fonctionne le classement</Link>.
      </p>
      <h2>4. Demandes de contact</h2>
      <p>
        Les messages envoyés depuis une fiche sont transmis à l&apos;organisme concerné. Celui-ci s&apos;engage à les utiliser uniquement
        pour répondre à la demande, conformément au RGPD.
      </p>
      <h2>5. Signalement</h2>
      <p>
        Tout contenu illicite ou trompeur peut être signalé à <a href={`mailto:${CONTACT_EMAIL}?subject=Signalement`}>{CONTACT_EMAIL}</a>. Les
        signalements sont traités avec diligence et la décision est motivée.
      </p>
      <h2>6. Modification des conditions</h2>
      <p>Les organismes inscrits sont informés de toute modification au moins 15 jours avant son entrée en vigueur.</p>
      <h2>7. Réclamations</h2>
      <p>Toute réclamation peut être adressée à {CONTACT_EMAIL}. Nous répondons sous 15 jours.</p>
    </LegalPage>
  );
}
