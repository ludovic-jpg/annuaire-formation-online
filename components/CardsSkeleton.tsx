/** Squelette de grille de cartes, affiché pendant le chargement d'une liste. */
export function CardsSkeleton({ n = 6 }: { n?: number }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-[20px] border-[3px] border-encre/15 bg-white">
          <div className="skeleton aspect-[16/10] !rounded-none" />
          <div className="grid gap-3 p-4">
            <div className="skeleton h-5 w-4/5" />
            <div className="skeleton h-4 w-1/2" />
            <div className="flex gap-2">
              <div className="skeleton h-6 w-16" />
              <div className="skeleton h-6 w-20" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
