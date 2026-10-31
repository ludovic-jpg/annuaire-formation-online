/**
 * Barre d'action collée en bas d'écran sur mobile : sur une fiche, le formulaire de contact
 * arrive après tout le contenu. La barre donne l'accès direct au formulaire et au programme complet.
 */
export function MobileContactBar({ orgName, sourceUrl, rel }: { orgName: string; sourceUrl?: string | null; rel: string }) {
  return (
    <>
      <div aria-hidden="true" className="h-20 lg:hidden" />
      <nav
        aria-label="Actions de la fiche"
        className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-encre bg-white/95 px-3 pt-2.5 backdrop-blur lg:hidden"
        style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-xl gap-2">
          <a href="#t-contact" className="btn btn-nuit flex-1 !px-3 text-[0.95rem]">
            Écrire à l&apos;organisme
            <span className="sr-only"> {orgName}</span>
          </a>
          {sourceUrl && (
            <a href={sourceUrl} target="_blank" rel={rel} className="btn btn-blanc !px-3 text-[0.95rem]">
              Programme
              <span className="sr-only"> complet sur le site de l&apos;organisme (nouvel onglet)</span>
            </a>
          )}
        </div>
      </nav>
    </>
  );
}
