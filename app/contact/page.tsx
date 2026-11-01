import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CONTACT_EMAIL } from "@/lib/env";

export const metadata: Metadata = {
  title: "Contact et signalement",
  description: "Contacter l'équipe d'Annuaire Formation Online ou signaler un contenu.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero title="Contact et signalement" intro="Une question sur l'annuaire, une fiche à corriger ou un contenu à signaler : écrivez-nous.">
        <Breadcrumbs items={[{ label: "Contact" }]} />
      </PageHero>
      <div className="mx-auto grid max-w-5xl gap-5 px-4 py-12 md:grid-cols-3">
        <div className="brut bg-white p-6">
          <h2 className="text-2xl">Une question</h2>
          <p className="mt-2">Sur le fonctionnement, votre compte ou une fiche.</p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-jaune mt-4 break-all">Écrire à l&apos;équipe</a>
        </div>
        <div className="brut bg-white p-6">
          <h2 className="text-2xl">Un signalement</h2>
          <p className="mt-2">Indiquez l&apos;adresse de la page et ce qui pose problème. Nous répondons avec une décision motivée.</p>
          <a href={`mailto:${CONTACT_EMAIL}?subject=Signalement%20de%20contenu`} className="btn btn-blanc mt-4">Signaler un contenu</a>
        </div>
        <div className="brut bg-nuit p-6 text-white">
          <h2 className="text-2xl">Contacter un organisme</h2>
          <p className="mt-2 text-white/85">Utilisez le formulaire présent sur chaque fiche : votre message va directement à l&apos;organisme.</p>
          <Link href="/formations" className="btn btn-jaune mt-4">Trouver une formation</Link>
        </div>
      </div>
      <section aria-labelledby="t-faq-contact" className="mx-auto max-w-5xl px-4 pb-6">
        <h2 id="t-faq-contact" className="text-3xl">Avant de nous écrire</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="calm-card p-5">
            <h3 className="font-display text-xl">Corriger ou compléter une fiche</h3>
            <p className="mt-2">
              Indiquez l&apos;adresse de la fiche, la rubrique concernée et le texte exact à modifier. Si vous êtes l&apos;organisme, précisez-le :
              les fiches reprennent le texte publié par l&apos;organisme sur son propre site, et c&apos;est cette source qui fait foi.
            </p>
          </div>
          <div className="calm-card p-5">
            <h3 className="font-display text-xl">Signaler un contenu</h3>
            <p className="mt-2">
              Joignez l&apos;adresse de la page, ce qui pose problème (information inexacte, mention CPF ou certification erronée, contenu qui ne vous appartient pas)
              et, si possible, un justificatif. Chaque signalement est lu par une personne, qui répond avec une décision motivée.
            </p>
          </div>
          <div className="calm-card p-5">
            <h3 className="font-display text-xl">Publier vos parcours et vos articles</h3>
            <p className="mt-2">
              Les organismes de formation et les formateurs indépendants peuvent référencer leurs parcours et publier des articles : 5 publications offertes,
              puis 1 € par fiche ou article. Tout contenu est relu avant sa mise en ligne.{" "}
              <Link href="/publier" className="font-semibold underline underline-offset-4">Voir comment publier</Link>.
            </p>
          </div>
          <div className="calm-card p-5">
            <h3 className="font-display text-xl">Vous cherchez une formation</h3>
            <p className="mt-2">
              L&apos;annuaire ne vend pas de formation : il compare des parcours. Pour vous inscrire ou obtenir un devis, utilisez le formulaire de la fiche,
              ou parcourez les <Link href="/formations" className="font-semibold underline underline-offset-4">formations</Link>, les{" "}
              <Link href="/blog" className="font-semibold underline underline-offset-4">articles du blog</Link> et la page{" "}
              <Link href="/comment-fonctionne-le-classement" className="font-semibold underline underline-offset-4">sur le classement</Link>.
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-prose text-encre/80">
          Pour les questions juridiques (données personnelles, droit d&apos;auteur), consultez d&apos;abord les{" "}
          <Link href="/mentions-legales" className="underline underline-offset-4">mentions légales</Link>, la{" "}
          <Link href="/confidentialite" className="underline underline-offset-4">politique de confidentialité</Link> et les{" "}
          <Link href="/cgu" className="underline underline-offset-4">conditions d&apos;utilisation</Link>.
        </p>
      </section>
      <p className="mx-auto max-w-5xl px-4 text-encre/75">Adresse : {CONTACT_EMAIL}. Courrier : Back to Business, 91 Grand Rue Pierre Braun, 68170 Rixheim.</p>
    </>
  );
}
