import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Comment fonctionne le classement",
  description: "Conditions de référencement et de déréférencement, critères de classement des fiches et liens avec l'éditeur de l'annuaire.",
  alternates: { canonical: "/comment-fonctionne-le-classement" },
};

export default function ClassementPage() {
  return (
    <LegalPage title="Comment fonctionne le classement" updated="31 octobre 2026">
      <p>
        Cette page répond à l&apos;article L111-7 et à l&apos;article D111-6 du Code de la consommation, ainsi qu&apos;au règlement
        européen 2019/1150 (dit « P2B »). Elle est accessible depuis toutes les pages de l&apos;annuaire.
      </p>

      <h2>Qui peut être référencé</h2>
      <ul>
        <li>Les organismes de formation disposant d&apos;un SIRET, qui créent un compte et décrivent leur organisme.</li>
        <li>Chaque fiche correspond à un parcours réel, décrit par un résumé original et renvoyant vers la page du parcours sur le site de l&apos;organisme.</li>
        <li>Chaque fiche est relue avant publication. Un refus est toujours motivé par écrit dans l&apos;espace de l&apos;organisme.</li>
        <li>Publier coûte 1 € par fiche ou article (5 publications offertes). Aucune somme ne permet aujourd&apos;hui d&apos;obtenir un meilleur classement.</li>
      </ul>

      <h2>Déréférencement</h2>
      <p>
        Une fiche peut être retirée si elle contient des informations inexactes ou trompeuses, si le lien vers le site de l&apos;organisme ne
        fonctionne plus, si elle reprend mot pour mot un autre contenu, ou à la suite d&apos;un signalement fondé. L&apos;organisme est
        informé du motif. Il peut aussi retirer ses fiches à tout moment.
      </p>

      <h2>Critères de classement par défaut</h2>
      <p>Les résultats sont triés, dans cet ordre&nbsp;:</p>
      <ol className="list-decimal pl-6">
        <li><strong>Pertinence</strong> par rapport aux mots recherchés (titre, puis résumé, puis public et ville), quand une recherche est saisie.</li>
        <li><strong>Complétude de la fiche</strong> (score de 0 à 100 : résumé, objectifs, durée, prix, public, prérequis, modalité, lien…).</li>
        <li><strong>Date de publication</strong>, de la plus récente à la plus ancienne.</li>
      </ol>
      <p>Les filtres (thème, ville, modalité, CPF, certification) restreignent la liste sans changer cet ordre.</p>

      <h2>Liens avec l&apos;éditeur</h2>
      <p>
        L&apos;annuaire est édité par Back to Business SASU (nom commercial Formatrix), dont le président, Ludovic Albisser, détient
        100&nbsp;% du capital. Il détient également 80&nbsp;% du capital de Skills4mation. Les marques suivantes appartiennent au même
        groupe&nbsp;: Formatrix, Skills4mation, FormaRH, FormaLangue, FormaDigital, FormaVente, FormaBienêtre, FormaCompta et
        bilandecompetence.pro.
      </p>
      <ul>
        <li>Leurs fiches portent la mention « Organisme lié à l&apos;éditeur de l&apos;annuaire ».</li>
        <li>Elles suivent les mêmes règles de relecture et de classement que les autres, sans avantage.</li>
        <li>Les liens vers leurs sites portent l&apos;attribut <code>rel=&quot;sponsored&quot;</code>&nbsp;; les liens vers les autres organismes portent <code>rel=&quot;ugc&quot;</code>.</li>
      </ul>

      <h2>Avis</h2>
      <p>L&apos;annuaire ne publie pas d&apos;avis pour le moment.</p>

      <h2>Modification de ces règles</h2>
      <p>Toute modification est annoncée aux organismes inscrits au moins 15 jours avant son entrée en vigueur.</p>
    </LegalPage>
  );
}
