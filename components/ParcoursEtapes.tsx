import Link from "next/link";
import type { Etape } from "@/lib/parcours-of";

const PASTILLE: Record<Etape["etat"], string> = {
  fait: "bg-jaune border-encre",
  "en-cours": "bg-encre text-white border-encre",
  "a-venir": "bg-white border-encre/30 text-encre/60",
};

/** Frise des 5 étapes : où en est l'organisme, et quelle est la prochaine action. */
export function ParcoursEtapes({ etapes }: { etapes: Etape[] }) {
  const courante = etapes.findIndex((e) => e.etat === "en-cours");
  const faites = etapes.filter((e) => e.etat === "fait").length;
  return (
    <section aria-labelledby="t-etapes" className="calm-card p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="t-etapes" className="text-lg">Votre parcours de publication</h2>
        <p className="text-sm font-semibold text-encre/75">
          {faites} étape{faites > 1 ? "s" : ""} sur {etapes.length}
        </p>
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-5 sm:gap-2">
        {etapes.map((e, i) => (
          <li
            key={e.titre}
            aria-current={i === courante ? "step" : undefined}
            className={`relative flex items-start gap-3 rounded-xl p-2.5 sm:flex-col sm:items-start sm:gap-2 ${i === courante ? "bg-jaune-pale ring-2 ring-encre" : ""}`}
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute -top-3 left-[1.6rem] h-3 w-0.5 sm:-left-2 sm:top-[1.55rem] sm:h-0.5 sm:w-2 ${etapes[i - 1].etat === "fait" ? "bg-encre" : "bg-encre/20"}`}
              />
            )}
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-[2.5px] font-display text-sm font-extrabold ${PASTILLE[e.etat]}`}
            >
              {e.etat === "fait" ? (
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
                  <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="#0D1240" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span aria-hidden="true">{i + 1}</span>
              )}
            </span>
            <span className="min-w-0">
              <span className="block font-semibold leading-tight">
                {e.titre}
                <span className="sr-only"> : {e.etat === "fait" ? "terminée" : e.etat === "en-cours" ? "étape en cours" : "à venir"}.</span>
              </span>
              <span className="block text-sm text-encre/75">{e.detail}</span>
              {e.action && e.href && (
                <Link href={e.href} className="tap mt-1 text-sm font-bold text-vif underline underline-offset-2">
                  {e.action}
                </Link>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
