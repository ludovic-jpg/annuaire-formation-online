import Link from "next/link";
import { Mascotte } from "@/components/Mascotte";

export default function NotFound() {
  return (
    <div className="dots">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center">
        <Mascotte score={15} className="h-32 w-32" />
        <h1 className="text-4xl sm:text-5xl">Cette page n&apos;existe pas (ou plus).</h1>
        <p className="text-lg">La fiche a peut-être été retirée par son organisme. Lancez une recherche pour trouver un parcours proche.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/formations" className="btn btn-jaune">
            Rechercher une formation
          </Link>
          <Link href="/" className="btn btn-blanc">
            Revenir à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
