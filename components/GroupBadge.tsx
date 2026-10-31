import Link from "next/link";

/** Mention obligatoire (art. D111-6 C. conso) : lien capitalistique avec l'éditeur. */
export function GroupBadge({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href="/comment-fonctionne-le-classement"
        className="relative z-10 inline-flex min-h-6 items-center gap-1.5 self-start rounded-full border-[1.5px] border-dashed border-encre/50 px-2.5 text-xs font-semibold text-encre/80 hover:border-encre hover:bg-jaune-pale"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 7v4.2M8 4.6v.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Organisme lié à l&apos;éditeur
      </Link>
    );
  }
  return (
    <p className="relative z-10 rounded-lg bg-jaune-pale px-3 py-2 text-xs text-encre/80">
      Organisme lié à l&apos;éditeur de l&apos;annuaire.{" "}
      <Link href="/comment-fonctionne-le-classement" className="tap font-semibold underline underline-offset-2">
        En savoir plus
      </Link>
    </p>
  );
}
