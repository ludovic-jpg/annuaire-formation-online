import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-encre bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        <Link href="/" className="mr-auto rounded-lg" aria-label="Accueil Annuaire Formation Online">
          <Wordmark />
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-1 sm:gap-2">
          <Link href="/formations" className="rounded-lg px-1.5 py-2 text-[0.95rem] font-semibold hover:bg-jaune-pale sm:px-2.5 sm:text-base">
            Formations
          </Link>
          <Link href="/espace" className="hidden rounded-lg px-2.5 py-2 font-semibold hover:bg-jaune-pale sm:inline-block">
            Espace organisme
          </Link>
          <Link href="/publier" className="btn btn-jaune !min-h-10 !gap-0 !px-3 text-sm sm:text-base">
            Publier<span className="hidden sm:inline">&nbsp;mes parcours</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
