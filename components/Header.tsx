import Link from "next/link";
import { Wordmark } from "@/components/Logo";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-encre bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <Link href="/" className="mr-auto rounded-lg" aria-label="Accueil Annuaire Formation Online">
          <Wordmark />
        </Link>
        <nav aria-label="Navigation principale" className="flex items-center gap-1 sm:gap-2">
          <Link href="/formations" className="rounded-lg px-2.5 py-2 font-semibold hover:bg-jaune-pale">
            Formations
          </Link>
          <Link href="/espace" className="hidden rounded-lg px-2.5 py-2 font-semibold hover:bg-jaune-pale sm:inline-block">
            Espace organisme
          </Link>
          <Link href="/publier" className="btn btn-jaune !min-h-10 !px-3 text-sm sm:text-base">
            Publier mes parcours
          </Link>
        </nav>
      </div>
    </header>
  );
}
