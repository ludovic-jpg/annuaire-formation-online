import type { Metadata } from "next";
import Link from "next/link";
import { searchPrograms, cityList } from "@/lib/data";
import { SPHERES, MODALITES, CERTIFICATIONS, sphereLabel } from "@/lib/spheres";
import { ProgramCard } from "@/components/ProgramCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Mascotte } from "@/components/Mascotte";
import { META, FORMATIONS_INTRO } from "@/lib/contenu/pages";

type SP = Promise<Record<string, string | string[] | undefined>>;
const PER_PAGE = 24;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Indexation de la recherche :
 * - /formations et /formations?page=N (sans autre paramètre) : indexables, canonical vers elles-mêmes ;
 * - toute URL filtrée (q, thème, ville, modalité, CPF, certification) : noindex, follow, sans canonical
 *   (on ne mélange pas noindex et canonical vers une autre URL, signaux contradictoires).
 */
export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(one(sp.page) || "1", 10) || 1);
  const filtered = Object.entries(sp).some(([k, v]) => k !== "page" && one(v));
  if (filtered) {
    const sphere = one(sp.sphere);
    return {
      title: sphere && SPHERES.some((s) => s.slug === sphere) ? `Recherche : formations ${sphereLabel(sphere).toLowerCase()}` : "Résultats de recherche de formations",
      description: META.formations.description,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: page > 1 ? `${META.formations.title} (page ${page})` : META.formations.title,
    description: META.formations.description,
    alternates: { canonical: page > 1 ? `/formations?page=${page}` : "/formations" },
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

  const modLabel = MODALITES.find((m) => m.value === modality)?.label;
  const actifs = [
    q && { key: "q", label: `« ${q} »` },
    sphere && SPHERES.some((s) => s.slug === sphere) && { key: "sphere", label: sphereLabel(sphere) },
    modLabel && { key: "modalite", label: modLabel },
    city && { key: "ville", label: city },
    cpf && { key: "cpf", label: "Éligible CPF" },
    certification && { key: "certification", label: `Certifiant ${certification}` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <>
      <section className="dots border-b-[3px] border-encre">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Formations" }]} />
          <h1 className="mt-4 text-4xl sm:text-5xl">{sphere ? `Formations ${sphereLabel(sphere).toLowerCase()}` : "Toutes les formations"}</h1>
          <p className="mt-3 max-w-2xl text-lg">
            {sphere && SPHERES.some((s) => s.slug === sphere) ? (
              <>
                Résultats filtrés. Le{" "}
                <Link href={`/theme/${sphere}`} className="font-semibold underline underline-offset-4">guide du thème {sphereLabel(sphere).toLowerCase()}</Link>{" "}
                donne des repères pour bien choisir.
              </>
            ) : (
              FORMATIONS_INTRO
            )}
          </p>
          <form action="/formations" method="get" role="search" className="brut mt-6 grid gap-3 bg-white p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <div className="sm:col-span-2 lg:col-span-1">
              <label htmlFor="f-q" className="label">Mot-clé</label>
              <input id="f-q" name="q" type="search" enterKeyHint="search" defaultValue={q} className="field" placeholder="Métier, compétence, langue…" />
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
              <input id="f-ville" name="ville" list="villes" autoComplete="off" defaultValue={city} className="field" placeholder="Toutes" />
              <datalist id="villes">
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="order-last flex flex-wrap items-end gap-3 sm:col-span-2 lg:order-none lg:col-span-1">
              <button type="submit" className="btn btn-nuit w-full lg:w-auto">Filtrer</button>
            </div>
            <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-2 lg:col-span-5">
              <legend className="sr-only">Options</legend>
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold">
                <input type="checkbox" name="cpf" value="1" defaultChecked={cpf} className="check" />
                Éligible CPF
              </label>
              <label className="inline-flex items-center gap-2 font-semibold">
                Certification
                <select name="certification" defaultValue={certification} className="field !min-h-11 !w-auto !py-1">
                  <option value="">Indifférent</option>
                  {CERTIFICATIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

            </fieldset>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {actifs.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="sr-only">Filtres actifs</h2>
            <ul className="flex flex-wrap gap-2">
              {actifs.map((a) => (
                <li key={a.key}>
                  <Link href={qs({ [a.key]: "", page: "" })} className="chip min-h-9 gap-2 !bg-jaune hover:!bg-jaune-pale">
                    {a.label}
                    <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full bg-encre text-[0.7rem] text-white">✕</span>
                    <span className="sr-only">(retirer ce filtre)</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/formations" className="tap px-1 text-sm font-semibold underline underline-offset-4">Tout effacer</Link>
          </div>
        )}
        <h2 className="sr-only">Résultats</h2>
        <p className="text-sm text-encre/80" aria-live="polite">
          <strong className="font-display text-base font-extrabold text-encre">{count} parcours trouvé{count > 1 ? "s" : ""}.</strong> Classés par complétude de la fiche puis date de publication
          {q ? ", après pertinence de la recherche" : ""}.{" "}
          <Link href="/comment-fonctionne-le-classement" className="tap underline underline-offset-2">Pourquoi cet ordre&nbsp;?</Link>
        </p>
        {items.length ? (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <li key={p.id}>
                <ProgramCard p={p} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="brut mt-6 flex flex-col items-center gap-5 bg-white p-6 text-center sm:flex-row sm:items-start sm:p-8 sm:text-left">
            <Mascotte score={30} className="h-24 w-24 shrink-0" />
            <div>
              <p className="font-display text-2xl font-extrabold">Aucun parcours ne correspond à ces critères.</p>
              <p className="mt-1 max-w-prose">
                Retirez un filtre ou essayez un mot plus général, par exemple « anglais » plutôt que « anglais des affaires B2 ».
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Link href="/formations" className="btn btn-jaune">Voir toutes les formations</Link>
              </div>
              
            </div>
          </div>
        )}
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {page > 1 && (
              <Link className="btn btn-blanc" href={qs({ page: page - 1 > 1 ? String(page - 1) : "" })} rel="prev">
                Précédente
              </Link>
            )}
            <ul className="flex gap-1.5">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <Link
                    href={qs({ page: n > 1 ? String(n) : "" })}
                    aria-current={n === page ? "page" : undefined}
                    aria-label={`Page ${n}`}
                    className={`grid h-11 w-11 place-items-center rounded-xl border-[3px] border-encre font-display font-extrabold ${n === page ? "bg-encre text-white" : "bg-white hover:bg-jaune-pale"}`}
                  >
                    {n}
                  </Link>
                </li>
              ))}
            </ul>
            {page < pages && (
              <Link className="btn btn-blanc" href={qs({ page: String(page + 1) })} rel="next">
                Suivante
              </Link>
            )}
          </nav>
        )}
        {!sphere && (
          <nav aria-labelledby="t-par-theme" className="mt-14">
            <h2 id="t-par-theme" className="text-2xl">Parcourir par thème</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SPHERES.map((s) => (
                <li key={s.slug}>
                  <Link href={`/theme/${s.slug}`} className="chip hover:bg-jaune-pale">{s.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </>
  );
}
