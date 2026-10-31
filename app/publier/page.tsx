import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mascotte } from "@/components/Mascotte";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LOGOS_GROUPE } from "@/lib/visuels";

export const metadata: Metadata = {
  title: "Organismes de formation : publiez vos parcours gratuitement",
  description: "Référencez vos parcours de formation gratuitement : connexion par e-mail, fiche guidée avec aperçu en direct, relecture sous 2 jours ouvrés, lien vers votre site.",
  alternates: { canonical: "/publier" },
};

const ETAPES = [
  ["Connectez-vous avec votre e-mail", "Pas de mot de passe : vous recevez un lien de connexion. Le compte se crée tout seul."],
  ["Présentez votre organisme", "Nom, SIRET, numéro de déclaration d'activité, Qualiopi. Deux minutes, une seule fois."],
  ["Remplissez votre fiche", "Une section à la fois, avec l'aperçu en direct, l'enregistrement automatique et un score qui vous dit quoi compléter."],
  ["Envoyez-la en revue", "Nous relisons chaque fiche, en général sous 2 jours ouvrés. En cas de refus, le motif est écrit dans votre tableau de bord."],
  ["Recevez des demandes", "Une fois publiée, la fiche renvoie vers votre site et les apprenants vous écrivent directement."],
];

const FAQ = [
  ["Combien ça coûte ?", "Rien au lancement. Si une offre payante apparaît plus tard, elle sera annoncée au moins 15 jours à l'avance et ne donnera jamais de meilleur classement."],
  ["Qui peut publier ?", "Les organismes de formation disposant d'un SIRET. Le numéro de déclaration d'activité et la certification Qualiopi sont affichés quand vous les renseignez."],
  ["Puis-je copier le texte de mon site ?", "Non pour le résumé : il doit être original (80 à 150 mots). Un copier-coller ferait doublon avec votre propre page et nuirait à son référencement. Le lien « Voir le programme complet » mène à votre page détaillée."],
  ["Comment les fiches sont-elles classées ?", "Par pertinence de la recherche, puis par complétude de la fiche, puis par date de publication. Tous les critères sont expliqués sur la page dédiée."],
  ["Le lien vers mon site est-il suivi ?", "Il porte l'attribut rel=\"ugc\", recommandé par Google pour les contenus publiés par les utilisateurs. Il vous apporte des visiteurs qualifiés, pas un « backlink » artificiel."],
  ["Puis-je retirer une fiche ?", "Oui, à tout moment depuis votre espace, ou par simple e-mail."],
];

export default function PublierPage() {
  return (
    <>
      <section className="border-b-[3px] border-encre bg-jaune">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:py-14 md:grid-cols-[1.5fr_1fr]">
          <div>
            <Breadcrumbs items={[{ label: "Publier mes parcours" }]} />
            <h1 className="mt-5 text-4xl sm:text-6xl">Vos parcours, là où les apprenants cherchent.</h1>
            <p className="mt-5 max-w-xl text-lg font-medium">
              Publiez gratuitement une fiche par parcours. Elle met en avant l&apos;essentiel (durée, prix, modalité, CPF) et renvoie vers
              votre site.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/connexion?suite=/espace" className="btn btn-nuit text-lg">Publier mes parcours gratuitement</Link>
              <Link href="/liste-attente" className="btn btn-blanc">Être prévenu plus tard</Link>
            </div>
          </div>
          <div className="relative mx-auto">
            <div className="brut rotate-2 bg-white p-6">
              <Mascotte score={100} className="h-44 w-44" />
            </div>
            <span className="brut-sm absolute -bottom-4 -left-6 -rotate-6 bg-vif px-3 py-1.5 font-display text-lg font-extrabold text-white">
              100&nbsp;% complète
            </span>
          </div>
        </div>
      </section>

      <div className="dots">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-3xl sm:text-4xl">Cinq étapes, sans paperasse</h2>
          <ol className="mt-8 grid gap-5 md:grid-cols-5">
            {ETAPES.map(([t, d], i) => (
              <li key={t} className={`brut p-5 ${i === 2 ? "bg-nuit text-white md:-translate-y-3" : "bg-white"}`}>
                <span className="font-display text-4xl font-extrabold" aria-hidden="true">{i + 1}</span>
                <h3 className="mt-2 text-xl leading-tight">{t}</h3>
                <p className={`mt-2 text-[0.95rem] ${i === 2 ? "text-white/85" : "text-encre/80"}`}>{d}</p>
              </li>
            ))}
          </ol>

          <section aria-labelledby="t-groupe" className="brut mt-14 bg-white p-6 sm:p-8">
            <h2 id="t-groupe" className="text-2xl sm:text-3xl">Qui édite l&apos;annuaire&nbsp;?</h2>
            <p className="mt-3 max-w-3xl">
              Annuaire Formation Online est édité par Back to Business (nom commercial Formatrix), organisme de formation à Rixheim. Les
              parcours de nos marques y figurent aussi : ils sont signalés sur chaque fiche et ne sont pas favorisés dans le classement.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Marques du groupe présentes dans l'annuaire">
              {LOGOS_GROUPE.map((l, i) => (
                <li key={l.name} className={`brut-sm flex flex-col items-center justify-center gap-2 bg-creme p-3 ${i < 2 ? "sm:col-span-1 lg:col-span-1" : ""}`}>
                  <span className="flex h-16 w-full items-center justify-center">
                    <Image src={l.src} alt="" width={l.w} height={l.h} className={`max-h-16 w-auto object-contain ${l.w / l.h > 2 ? "max-w-[90%]" : "h-16"}`} />
                  </span>
                  <span className="text-center text-sm font-semibold">{l.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="t-faq" className="mt-14">
            <h2 id="t-faq" className="text-3xl sm:text-4xl">Questions fréquentes</h2>
            <div className="mt-6 grid gap-3">
              {FAQ.map(([q, a]) => (
                <details key={q} className="brut-sm group bg-white p-4 open:bg-creme">
                  <summary className="cursor-pointer list-none font-display text-lg font-extrabold">
                    <span className="mr-2 inline-block transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                    {q}
                  </summary>
                  <p className="mt-2 pl-6">{a}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="mt-14 text-center">
            <Link href="/connexion?suite=/espace" className="btn btn-jaune text-lg">Publier mes parcours gratuitement</Link>
          </div>
        </div>
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
        }}
      />
    </>
  );
}
