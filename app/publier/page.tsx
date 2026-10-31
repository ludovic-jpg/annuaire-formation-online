import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mascotte } from "@/components/Mascotte";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { META, PUBLIER } from "@/lib/contenu/pages";
import { LOGOS_GROUPE } from "@/lib/visuels";

export const metadata: Metadata = {
  title: META.publier.title,
  description: META.publier.description,
  alternates: { canonical: "/publier" },
  openGraph: { title: META.publier.title, description: META.publier.description, url: "/publier" },
};

const ETAPES = [
  ["Connectez-vous avec votre e-mail", "Pas de mot de passe : vous recevez un lien de connexion. Le compte se crée tout seul."],
  ["Présentez votre organisme", "Nom, SIRET, numéro de déclaration d'activité, Qualiopi. Deux minutes, une seule fois."],
  ["Remplissez votre fiche", "Une section à la fois, avec l'aperçu en direct, l'enregistrement automatique et un score qui vous dit quoi compléter."],
  ["Envoyez-la en revue", "Nous relisons chaque fiche, en général sous 2 jours ouvrés. En cas de refus, le motif est écrit dans votre tableau de bord."],
  ["Recevez des demandes", "Une fois publiée, la fiche renvoie vers votre site et les apprenants vous écrivent directement."],
];


export default function PublierPage() {
  return (
    <>
      <section className="border-b-4 border-encre bg-jaune">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:py-14 md:grid-cols-[1.5fr_1fr]">
          <div>
            <Breadcrumbs items={[{ label: "Publier mes parcours" }]} />
            <h1 className="mt-5 text-4xl sm:text-6xl">{PUBLIER.h1}</h1>
            <p className="mt-5 max-w-xl text-lg font-medium">{PUBLIER.chapo}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/connexion?suite=/espace" className="btn btn-nuit text-lg">Publier mes parcours</Link>
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

          <section aria-labelledby="t-tarif" className="brut mt-14 grid gap-6 bg-white p-6 sm:p-8 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <h2 id="t-tarif" className="text-2xl sm:text-3xl">Combien ça coûte&nbsp;?</h2>
              <p className="mt-3 max-w-prose text-lg">
                <strong>5 € offerts à l&apos;inscription, soit 5 publications.</strong> Ensuite, 1 € par fiche ou par article publié.
              </p>
              <ul className="mt-4 grid list-disc gap-2 pl-5 text-encre/85">
                <li>Rien n&apos;est débité tant que la fiche ou l&apos;article n&apos;est pas validé et mis en ligne.</li>
                <li>Une seule fois par fiche ou article : le modifier puis le republier ne coûte rien de plus.</li>
                <li>Pas d&apos;abonnement, pas d&apos;engagement. Votre solde et son historique sont visibles dans votre espace.</li>
                <li>Le classement ne s&apos;achète pas : le prix est le même pour tous et ne change rien à la position.</li>
              </ul>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-center">
              <div className="brut-sm bg-jaune p-4">
                <dt className="text-sm font-semibold">Offert</dt>
                <dd className="font-display text-4xl font-extrabold">5&nbsp;€</dd>
                <dd className="text-sm">5 publications</dd>
              </div>
              <div className="brut-sm bg-creme p-4">
                <dt className="text-sm font-semibold">Ensuite</dt>
                <dd className="font-display text-4xl font-extrabold">1&nbsp;€</dd>
                <dd className="text-sm">par fiche ou article</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="t-groupe" className="brut mt-14 bg-white p-6 sm:p-8">
            <h2 id="t-groupe" className="text-2xl sm:text-3xl">Qui édite l&apos;annuaire&nbsp;?</h2>
            <p className="mt-3 max-w-3xl">
              Annuaire Formation Online est édité par Back to Business (nom commercial Formatrix), organisme de formation à Rixheim. Les
              parcours de nos marques y figurent aussi : ils sont signalés sur chaque fiche et ne sont pas favorisés dans le classement.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Marques du groupe présentes dans l'annuaire">
              {LOGOS_GROUPE.map((l) => (
                <li key={l.name} className="flex">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="sponsored noopener"
                    className="brut-sm lift flex w-full flex-col items-center justify-center gap-2 bg-creme p-3 hover:bg-jaune-pale"
                  >
                    <span className="flex h-16 w-full items-center justify-center">
                      <Image src={l.src} alt="" width={l.w} height={l.h} className={`max-h-16 w-auto object-contain ${l.w / l.h > 2 ? "max-w-[90%]" : "h-16"}`} />
                    </span>
                    <span className="text-center text-sm font-semibold">
                      {l.name}
                      <span className="sr-only"> (site de la marque, nouvel onglet)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="t-pourquoi" className="mt-14 max-w-prose">
            <h2 id="t-pourquoi" className="text-3xl sm:text-4xl">{PUBLIER.pourquoi.titre}</h2>
            {PUBLIER.pourquoi.paragraphes.map((t) => (
              <p key={t.slice(0, 20)} className="mt-4 text-lg">{t}</p>
            ))}
            <p className="mt-4 text-lg">
              Les règles de classement et de liens sont publiques :{" "}
              <Link href="/comment-fonctionne-le-classement" className="font-semibold underline underline-offset-4">comment fonctionne le classement</Link>{" "}
              et <Link href="/a-propos" className="font-semibold underline underline-offset-4">notre méthodologie</Link>.
            </p>
          </section>

          <div className="mt-14">
            <Faq id="t-faq" items={PUBLIER.faq} />
          </div>

          <div className="mt-14 text-center">
            <Link href="/connexion?suite=/espace" className="btn btn-jaune text-lg">Publier mes parcours</Link>
          </div>
        </div>
      </div>

    </>
  );
}
