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
      <p className="mx-auto max-w-5xl px-4 text-encre/75">Adresse : {CONTACT_EMAIL}. Courrier : Back to Business, 91 Grand Rue Pierre Braun, 68170 Rixheim.</p>
    </>
  );
}
