import Link from "next/link";

/** Mention obligatoire (art. D111-6 C. conso) : lien capitalistique avec l'éditeur. */
export function GroupBadge({ compact = false }: { compact?: boolean }) {
  return (
    <p className={`relative z-10 text-xs text-encre/75 ${compact ? "" : "rounded-lg bg-jaune-pale px-3 py-2"}`}>
      Organisme lié à l&apos;éditeur de l&apos;annuaire.{" "}
      <Link href="/comment-fonctionne-le-classement" className="underline underline-offset-2">
        En savoir plus
      </Link>
    </p>
  );
}
