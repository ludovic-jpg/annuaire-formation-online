import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WaitlistForm } from "./WaitlistForm";

export const metadata: Metadata = {
  title: "Liste d'attente des organismes",
  description: "Inscrivez votre organisme de formation pour être prévenu des nouveautés d'Annuaire Formation Online.",
  alternates: { canonical: "/liste-attente" },
};

export default function ListeAttentePage() {
  return (
    <>
      <PageHero title="Être prévenu" intro="Laissez votre adresse : nous vous écrivons dès l'ouverture de nouvelles fonctionnalités (import automatique des fiches, statistiques de visites).">
        <Breadcrumbs items={[{ label: "Liste d'attente" }]} />
      </PageHero>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <WaitlistForm />
      </div>
    </>
  );
}
