import type { Metadata } from "next";
import Link from "next/link";
import { searchPrograms, cityList } from "@/lib/data";
import { SPHERES, MODALITES, CERTIFICATIONS, sphereLabel } from "@/lib/spheres";
import { ProgramCard } from "@/components/ProgramCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Mascotte } from "@/components/Mascotte";

type SP = Promise<Record<string, string | string[] | undefined>>;
const PER_PAGE = 24;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.values(sp).some((v) => one(v));
  return {
    title: "Toutes les formations professionnelles",
    description: "Recherchez un parcours de formation par mot-clé, thème, ville, modalité, éligibilité CPF ou certification.",
    alternates: { canonical: "/formations" },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function FormationsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = one(sp.q).slice(0, 120);
  const sphere = one(sp.sphere);
  const modality = one(sp.modalite);
  const city = one(sp.ville);
  const cpf = one(sp.cpf) === "1";
  const certification = one(sp.certification);
  const page = Math.max(1, parseInt(one(sp.page) || "1", 10) || 1);

  const [{ items, count }, cities] = await Promise.all([
    searchPrograms({
      q,
      sphere: SPHERES.some((s) => s.slug === sphere) ? sphere : undefined,
      modality: MODALITES.some((m) => m.value === modality) ? modality : undefined,
      city: city || undefined,
      cpf,
      certification: (CERTIFICATIONS as readonly string[]).includes(certification) ? certification : undefined,
      limit: PER_PAGE,
      offset: (page - 1) * PER_PAGE,
    }),
    cityList(),
  ]);
  const pages = Math.max(1, Math.ceil(count / PER_PAGE));
  const qs = (patch: Record<string, string>) => {
    const u = new URLSearchParams();
    const base: Record<string, string> = { q, sphere, modalite: modality, ville: city, cpf: cpf ? "1" : "", certification, ...patch };
    for (const [k, v] of Object.entries(base)) if (v) u.set(k, v);
    const s = u.toString();
    return s ? `/formations?${s}` : "/formations";
  };

  return (
    <>
      <section className="dots border-b-[3px] border-encre">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Formations" }]} />
          <h1 className="mt-4 text-4xl sm:text-5xl">{sphere ? `Formations ${sphereLabel(sphere).toLowerCase()}` : "Toutes les formations"}</h1>
          <form action="/formations" method="get" role="search" className="brut mt-6 grid gap-3 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="f-q" className="label">Mot-clé</label>
              <input id="f-q" name="q" type="search" defaultValue={q} className="field" placeholder="Métier, compétence, langue…" />
            </div>
            <div>
              <label htmlFor="f-sphere" className="label">Thème</label>
              <select id="f-sphere" name="sphere" defaultValue={sphere} className="field">
                <option value="">Tous</option>
                {SPHERES.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-mod" className="label">Modalité</label>
              <select id="f-mod" name="modalite" defaultValue={modality} className="field">
                <option value="">Toutes</option>
                {MODALITES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="f-ville" className="label">Ville</label>
              <input id="f-ville" name="ville" list="villes" defaultValue={city} className="field" placeholder="Toutes" />
              <datalist id="villes">
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-1">
              <button type="submit" className="btn btn-nuit w-full lg:w-auto">Filtrer</button>
            </div>
            <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-2 lg:col-span-5">
              <legend className="sr-only">Options</legend>
              <label className="inline-flex min-h-6 items-center gap-2 font-medium">
                <input type="checkbox" name="cpf" value="1" defaultChecked={cpf} className="h-5 w-5 accent-nuit" />
                Éligible CPF
              </label>
              <label className="inline-flex items-center gap-2 font-medium">
                Certification
                <select name="certification" defaultValue={certification} className="field !min-h-9 !w-auto !py-1">
                  <option value="">Indifférent</option>
                  {CERTIFICATIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              {(q || sphere || modality || city || cpf || certification) && (
                <Link href="/formations" className="font-semibold underline underline-offset-4">Effacer les filtres</Link>
              )}
            </fieldset>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-sm text-encre/80" aria-live="polite">
          {count} parcours trouvé{count > 1 ? "s" : ""}. Classés par complétude de la fiche puis date de publication
          {q ? ", après pertinence de la recherche" : ""}.{" "}
          <Link href="/comment-fonctionne-le-classement" className="underline underline-offset-2">Pourquoi cet ordre&nbsp;?</Link>
        </p>
        {items.length ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <li key={p.id}>
                <ProgramCard p={p} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="calm-card mt-6 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <Mascotte score={30} className="h-20 w-20 shrink-0" />
            <div>
              <p className="font-display text-xl font-extrabold">Aucun parcours ne correspond à ces critères.</p>
              <p className="mt-1">Retirez un filtre ou essayez un mot plus général, par exemple « anglais » plutôt que « anglais des affaires B2 ».</p>
            </div>
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {page > 1 && <Link className="btn btn-blanc" href={qs({ page: String(page - 1) })}>Page précédente</Link>}
            <span className="px-3 font-semibold">Page {page} sur {pages}</span>
            {page < pages && <Link className="btn btn-blanc" href={qs({ page: String(page + 1) })}>Page suivante</Link>}
          </nav>
        )}
      </div>
    </>
  );
}
