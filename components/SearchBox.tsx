export function SearchBox({ defaultValue = "", big = false }: { defaultValue?: string; big?: boolean }) {
  return (
    <form action="/formations" method="get" role="search" className={`flex w-full gap-2 ${big ? "flex-col sm:flex-row" : ""}`}>
      <label htmlFor={big ? "q-hero" : "q"} className="sr-only">
        Métier, compétence ou mot-clé
      </label>
      <input
        id={big ? "q-hero" : "q"}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Excel, management, anglais, massage…"
        className={`brut-sm w-full bg-white px-4 font-medium placeholder:text-encre/50 focus:outline-none focus-visible:ring-4 focus-visible:ring-vif/40 ${big ? "min-h-14 text-lg" : "min-h-12"}`}
      />
      <button type="submit" className={`btn btn-nuit ${big ? "min-h-14 px-6 text-lg" : ""}`}>
        Rechercher
      </button>
    </form>
  );
}
