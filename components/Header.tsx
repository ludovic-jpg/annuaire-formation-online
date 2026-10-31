import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-encre bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-2.5 py-2 sm:gap-3 sm:py-2.5 sm:px-4">
        <Link href="/" className="mr-auto rounded-lg" aria-label="Accueil Annuaire Formation Online">
          <Wordmark />
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-0.5 sm:gap-2">
          <Link href="/formations" className="inline-flex min-h-11 items-center rounded-lg px-1.5 text-[0.9rem] font-semibold hover:bg-jaune-pale sm:px-2.5 sm:text-base">
            Formations
          </Link>
          <Link
            href="/espace"
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-1 font-semibold hover:bg-jaune-pale sm:px-2.5"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 sm:hidden">
              <circle cx="12" cy="8.5" r="4" fill="#FFCD1C" stroke="#0D1240" strokeWidth="2" />
              <path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" fill="none" stroke="#0D1240" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="sr-only sm:not-sr-only">Espace organisme</span>
          </Link>
          <Link href="/publier" className="btn btn-jaune !min-h-11 !gap-0 whitespace-nowrap !px-2.5 text-sm sm:!px-3 sm:text-base">
            Publier<span className="hidden sm:inline">&nbsp;mes parcours</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
