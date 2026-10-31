import Link from "next/link";
import { Mascotte } from "@/components/Mascotte";
import { SearchBox } from "@/components/SearchBox";
import { SPHERES } from "@/lib/spheres";

export default function NotFound() {
  return (
    <div className="dots">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-16 text-center sm:py-20">
        <Mascotte score={15} className="h-32 w-32 -rotate-6" />
        <h1 className="text-4xl sm:text-5xl">Cette page n&apos;existe pas (ou plus).</h1>
        <p className="max-w-prose text-lg">
          La fiche a peut-être été retirée par son organisme. Lancez une recherche pour trouver un parcours proche.
        </p>
        <div className="brut w-full max-w-xl bg-jaune p-4 text-left sm:p-5">
          <SearchBox />
        </div>
        <div>
          <p className="font-semibold">Ou partez d&apos;un thème&nbsp;:</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {SPHERES.map((s) => (
              <li key={s.slug}>
                <Link href={`/theme/${s.slug}`} className="chip min-h-9 hover:bg-jaune-pale">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Link href="/" className="tap font-semibold underline underline-offset-4">
          Revenir à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
