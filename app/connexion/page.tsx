import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginFlow } from "./LoginFlow";

export const metadata: Metadata = {
  title: "Connexion à l'espace organisme",
  robots: { index: false, follow: false },
  alternates: { canonical: "/connexion" },
};

export default function ConnexionPage() {
  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1fr_1.1fr] md:py-16">
        <div>
          <h1 className="text-4xl sm:text-5xl">Votre espace organisme</h1>
          <p className="mt-4 text-lg text-encre/85">
            Pas de mot de passe à retenir : indiquez votre adresse e-mail professionnelle, nous vous envoyons un lien de
            connexion valable une heure.
          </p>
          <ul className="mt-6 space-y-2 text-encre/85">
            <li>Gratuit au lancement, sans engagement.</li>
            <li>Vos fiches restent en brouillon tant que vous ne les envoyez pas en revue.</li>
            <li>Chaque fiche publiée renvoie vers votre site.</li>
          </ul>
        </div>
        <Suspense fallback={<div className="calm-card h-64 animate-pulse" />}>
          <LoginFlow />
        </Suspense>
      </div>
    </div>
  );
}
