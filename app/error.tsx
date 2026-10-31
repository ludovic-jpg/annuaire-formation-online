"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Mascotte } from "@/components/Mascotte";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="dots">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center">
        <Mascotte score={15} className="h-32 w-32" />
        <h1 className="text-4xl sm:text-5xl">Cette page n&apos;a pas pu se charger.</h1>
        <p className="max-w-prose text-lg">
          Le serveur n&apos;a pas répondu à temps. Réessayez : le plus souvent, la page s&apos;affiche au second essai. Si le
          problème continue, écrivez-nous depuis la page contact.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn btn-jaune">
            Réessayer
          </button>
          <Link href="/contact" className="btn btn-blanc">
            Signaler le problème
          </Link>
        </div>
        {error.digest && <p className="hint">Référence de l&apos;erreur&nbsp;: {error.digest}</p>}
      </div>
    </div>
  );
}
