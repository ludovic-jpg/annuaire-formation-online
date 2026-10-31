import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/jsonld";
import type { QuestionReponse } from "@/lib/contenu/themes";

/**
 * Questions fréquentes visibles à l'écran (accordéon natif <details>, contenu présent dans le HTML).
 * Le JSON-LD FAQPage n'est émis qu'ici, donc uniquement quand les questions sont affichées.
 */
export function Faq({ id, titre = "Questions fréquentes", items }: { id: string; titre?: string; items: QuestionReponse[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-3xl sm:text-4xl">{titre}</h2>
      <div className="mt-6 grid gap-3">
        {items.map(({ q, r }) => (
          <details key={q} className="brut-sm group bg-white p-4 open:bg-creme">
            <summary className="cursor-pointer list-none font-display text-lg font-extrabold">
              <span className="mr-2 inline-block transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              {q}
            </summary>
            <p className="mt-2 pl-6">{r}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqJsonLd(items)} />
    </section>
  );
}
