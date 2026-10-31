import { MESSAGE_RECHARGE, MOTIFS_CREDIT, PRIX_PUBLICATION_CENTS, formaterEuros, type Credit } from "@/lib/credits";

/** Carte « Mon crédit » de l'espace organisme : solde, règle, historique. */
export function CreditCard({ credit, id = "t-credit" }: { credit: Credit; id?: string }) {
  const bas = credit.actif && !credit.groupe && (credit.soldeCents ?? 0) < PRIX_PUBLICATION_CENTS;
  return (
    <section aria-labelledby={id} className={`calm-card p-5 sm:p-6 ${bas ? "border-brique" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id={id} className="text-2xl">Mon crédit</h2>
          <p className="mt-1 max-w-prose text-sm text-encre/75">
            1 € par fiche ou article publié, débité seulement à la mise en ligne. 5 € offerts à l&apos;inscription, soit 5 publications.
          </p>
        </div>
        <p className="font-display text-4xl font-extrabold" aria-live="polite">
          {credit.groupe ? (
            <span className="rounded-xl bg-menthe/25 px-3 py-1 text-2xl">Publication incluse</span>
          ) : credit.actif ? (
            formaterEuros(credit.soldeCents ?? 0)
          ) : (
            <span className="text-xl text-encre/70">Bientôt actif</span>
          )}
        </p>
      </div>
      {credit.groupe && (
        <p className="mt-3 text-sm text-encre/80">Votre organisme fait partie des marques du groupe : vos fiches et articles ne sont pas débités.</p>
      )}
      {!credit.actif && !credit.groupe && (
        <p className="mt-3 text-sm text-encre/80">Le crédit de publication s&apos;active très prochainement, avec 5 € offerts. En attendant, rien n&apos;est débité.</p>
      )}
      {bas && (
        <p role="status" className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-900">
          Solde insuffisant pour envoyer une nouvelle fiche ou un nouvel article en revue. {MESSAGE_RECHARGE}.
        </p>
      )}
      {credit.actif && credit.historique.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer font-semibold">Historique ({credit.historique.length})</summary>
          <table className="mt-3 w-full text-left text-sm">
            <caption className="sr-only">Mouvements de crédit, du plus récent au plus ancien</caption>
            <thead className="border-b">
              <tr>
                <th scope="col" className="py-2 pr-3">Date</th>
                <th scope="col" className="py-2 pr-3">Opération</th>
                <th scope="col" className="py-2 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {credit.historique.map((l) => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="py-2 pr-3">{new Date(l.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="py-2 pr-3">{MOTIFS_CREDIT[l.reason] ?? l.reason}</td>
                  <td className={`py-2 text-right font-semibold ${l.amount_cents < 0 ? "text-brique" : "text-emerald-700"}`}>
                    {l.amount_cents > 0 ? "+" : ""}
                    {formaterEuros(l.amount_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </section>
  );
}
