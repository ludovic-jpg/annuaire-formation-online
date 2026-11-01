import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { JsonLd } from "@/components/JsonLd";
import { META } from "@/lib/contenu/pages";
import { SITE_URL, CONTACT_EMAIL } from "@/lib/env";
import { EDITEUR_ID, SITE_ID } from "@/lib/jsonld";
import { SPHERES } from "@/lib/spheres";

export const metadata: Metadata = {
  title: META.aPropos.title,
  description: META.aPropos.description,
  alternates: { canonical: "/a-propos" },
  openGraph: { title: META.aPropos.title, description: META.aPropos.description, url: "/a-propos", images: [{ url: "/opengraph-image" }] },
};

const MAJ = "31 octobre 2026";

export default function AProposPage() {
  return (
    <LegalPage title="À propos et méthodologie" updated={MAJ}>
      <p>
        Annuaire Formation Online recense des parcours de formation professionnelle proposés en France. Chaque fiche décrit un parcours
        réel avec les mêmes informations, placées au même endroit, pour que l&apos;on puisse comparer des organismes différents.
      </p>

      <h2>Qui édite l&apos;annuaire</h2>
      <p>
        L&apos;annuaire est édité par Back to Business SASU, nom commercial Formatrix, organisme de formation installé au 91 Grand Rue
        Pierre Braun, 68170 Rixheim. Son président, Ludovic Albisser, en détient la totalité du capital. Les parcours des marques du
        groupe (Formatrix, Skills4mation, FormaRH, FormaLangue, FormaDigital, FormaVente, FormaBienêtre, FormaCompta,
        bilandecompetence.pro) figurent dans l&apos;annuaire : ils portent la mention « Organisme lié à l&apos;éditeur » et suivent les mêmes
        règles que les autres.
      </p>

      <h2>Ce que contient une fiche</h2>
      <ul>
        <li>Le titre du parcours et l&apos;organisme qui le propose, avec un lien vers la page du parcours sur le site de l&apos;organisme.</li>
        <li>La durée, le prix, la modalité (présentiel, à distance ou mixte) et, le cas échéant, la ville.</li>
        <li>L&apos;éligibilité au CPF et la certification préparée, quand il y en a une.</li>
        <li>Les objectifs, le public visé et les prérequis.</li>
        <li>Un résumé original de 80 à 150 mots, rédigé pour l&apos;annuaire et non copié du site de l&apos;organisme.</li>
      </ul>
      <p>
        Ces informations sont déclarées par l&apos;organisme. Quand une donnée manque, la fiche l&apos;indique (« Non précisé », « Sur
        demande ») plutôt que de la deviner. Le programme détaillé, les dates de session et l&apos;inscription restent sur le site de
        l&apos;organisme.
      </p>

      <h2>Comment les fiches sont relues</h2>
      <p>
        Chaque fiche est relue par une personne avant sa publication, en général sous 2 jours ouvrés. La relecture vérifie que le
        parcours existe, que le lien fonctionne, que le résumé est original et que les informations essentielles sont cohérentes. Un refus
        est toujours motivé par écrit dans l&apos;espace de l&apos;organisme. Une fiche peut être retirée après un signalement fondé, via la
        page <Link href="/contact">contact et signalement</Link>.
      </p>

      <h2>Comment les résultats sont classés</h2>
      <p>
        Par pertinence de la recherche, puis par complétude de la fiche, puis par date de publication. Aucune option payante ne modifie
        cet ordre. Le détail est sur la page <Link href="/comment-fonctionne-le-classement">comment fonctionne le classement</Link>.
      </p>

      <h2>Indexation par les moteurs de recherche</h2>
      <p>
        Nous ne demandons l&apos;indexation que des pages qui apportent quelque chose. Une page thème ou ville n&apos;est indexable qu&apos;à
        partir de trois parcours publiés par au moins deux organismes différents. Tant que les organismes extérieurs au groupe sont peu
        nombreux, les fiches des marques de l&apos;éditeur restent consultables mais ne sont pas proposées à l&apos;indexation. Le plan du site
        ne liste que les pages indexables.
      </p>
      <p>
        Les liens vers les sites des organismes portent l&apos;attribut <code>rel=&quot;ugc&quot;</code>, et <code>rel=&quot;sponsored&quot;</code>{" "}
        pour les marques de l&apos;éditeur. L&apos;annuaire ne vend pas de liens.
      </p>

      <h2>Données structurées et assistants conversationnels</h2>
      <p>
        Chaque fiche publie ses informations au format schema.org (Course, CourseInstance, EducationalOrganization), avec
        l&apos;organisme réel comme prestataire. Un résumé du site destiné aux assistants conversationnels est disponible à l&apos;adresse{" "}
        <a href="/llms.txt">/llms.txt</a>. Ces formats aident les machines à lire les fiches ; ils ne garantissent aucun affichage
        particulier dans les résultats.
      </p>

      <h2>Ce que l&apos;annuaire ne fait pas</h2>
      <ul>
        <li>Il ne vend pas de formation et ne prend pas de commission sur les inscriptions.</li>
        <li>Il ne publie pas d&apos;avis pour le moment.</li>
        <li>Il ne crée pas de pages par ville sans parcours réels derrière.</li>
      </ul>

      <h2>Thèmes couverts</h2>
      <p>
        {SPHERES.map((s, i) => (
          <span key={s.slug}>
            {i > 0 && ", "}
            <Link href={`/theme/${s.slug}`}>{s.label.toLowerCase()}</Link>
          </span>
        ))}
        .
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question sur l&apos;annuaire ou sur une fiche : <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Les organismes
        qui souhaitent référencer leurs parcours trouveront la marche à suivre sur la page <Link href="/publier">publier mes parcours</Link>.
      </p>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${SITE_URL}/a-propos#page`,
          url: `${SITE_URL}/a-propos`,
          name: "À propos et méthodologie",
          inLanguage: "fr-FR",
          isPartOf: { "@id": SITE_ID },
          about: { "@id": EDITEUR_ID },
          dateModified: "2026-10-31",
        }}
      />
    </LegalPage>
  );
}
