import Image from "next/image";
import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";
import { ProgramCard } from "@/components/ProgramCard";
import { Mascotte } from "@/components/Mascotte";
import { SPHERES } from "@/lib/spheres";
import { SPHERE_VISUELS, HERO_VISUEL } from "@/lib/visuels";
import { allPublishedLight, latestPrograms } from "@/lib/data";
import type { Metadata } from "next";
import { META, ACCUEIL_GUIDE, ACCUEIL_FAQ } from "@/lib/contenu/pages";
import { Faq } from "@/components/Faq";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: META.accueil.title },
  description: META.accueil.description,
  alternates: { canonical: "/" },
  openGraph: { title: META.accueil.title, description: META.accueil.description, url: "/" },
};

export default async function Home() {
  const [latest, all] = await Promise.all([latestPrograms(6), allPublishedLight()]);
  const perSphere = new Map<string, number>();
  for (const p of all) if (p.sphere) perSphere.set(p.sphere, (perSphere.get(p.sphere) ?? 0) + 1);
  const orgCount = new Set(all.map((p) => p.org_id)).size;

  return (
    <div className="dots">
      <div className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:pt-12">
        {/* Bento principal */}
        <div className="grid gap-5 md:grid-cols-3 md:grid-rows-[auto_auto]">
          <section aria-labelledby="titre-accueil" className="brut anim-pop relative overflow-hidden bg-jaune md:col-span-2 md:row-span-2">
            <div className="relative z-10 p-6 sm:p-9 lg:pr-[30%]">
              <h1 id="titre-accueil" className="text-[2.6rem] leading-[0.98] sm:text-6xl">
                <span className="tag-pixel mb-4">Annuaire des formations professionnelles</span>
                <span className="mt-3 block">Le bon parcours de formation, <span className="marker marker-cyan">sans détour.</span></span>
              </h1>
              <p className="mt-5 max-w-md text-lg font-medium">
                Durée, prix, modalité, CPF : comparez les parcours des organismes de formation, puis contactez celui qui vous
                convient.
              </p>
              <div className="mt-7 max-w-xl lg:max-w-lg">
                <SearchBox big />
              </div>
              <p className="mt-4 text-sm font-medium">
                Ou parcourez les <Link href="/formations" className="tap underline underline-offset-4">formations par filtres</Link>.
              </p>
            </div>
            <Image
              src={HERO_VISUEL}
              alt=""
              width={1024}
              height={643}
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
              className="pointer-events-none relative -mb-1 ml-auto w-[88%] md:w-[70%] lg:absolute lg:bottom-0 lg:right-[-8%] lg:w-[46%]"
            />
          </section>

          <section aria-labelledby="titre-of" className="on-dark brut anim-pop flex flex-col bg-nuit p-6 text-white [animation-delay:90ms]">
            <div className="flex items-start gap-4">
              <Mascotte score={100} className="h-24 w-24 shrink-0 -rotate-6" />
              <h2 id="titre-of" className="sans-marqueur text-2xl leading-tight">
                Organisme de formation&nbsp;? Vos parcours ont leur place ici.
              </h2>
            </div>
            <p className="mt-4 text-white/85">
              5 publications offertes, connexion par e-mail, une fiche prête en quelques minutes. Chaque fiche renvoie vers la
              page du parcours sur votre site.
            </p>
            <Link href="/publier" className="btn btn-jaune mt-5 self-start">
              Publier mes parcours
            </Link>
          </section>

          <section aria-label="L'annuaire en bref" className="brut anim-pop grid grid-cols-2 bg-white [animation-delay:160ms]">
            <div className="border-r-[3px] border-encre p-5">
              <p className="font-display text-5xl font-extrabold">{all.length ? all.length : "0\u00a0€"}</p>
              <p className="mt-1 text-sm font-semibold">{all.length ? "parcours publiés" : "pour publier une fiche"}</p>
            </div>
            <div className="p-5">
              <p className="font-display text-5xl font-extrabold">{all.length ? orgCount : "2\u00a0j"}</p>
              <p className="mt-1 text-sm font-semibold">{all.length ? "organismes" : "pour la relecture"}</p>
            </div>
            <p className="col-span-2 border-t-4 border-encre px-5 py-3 text-sm">
              Classement sans option payante.{" "}
              <Link href="/comment-fonctionne-le-classement" className="tap font-semibold underline underline-offset-2">
                Nos critères
              </Link>
            </p>
          </section>
        </div>

        {/* Sphères */}
        <section aria-labelledby="titre-themes" className="mt-14">
          <h2 id="titre-themes" className="text-3xl sm:text-4xl">
            Explorer par thème
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {SPHERES.map((s, i) => (
              <li key={s.slug} className={i === 0 ? "col-span-2 sm:col-span-1 lg:row-span-2" : ""}>
                <Link
                  href={`/theme/${s.slug}`}
                  className="brut-sm lift visual-tint visual-tint-strong group relative flex h-full min-h-36 flex-col justify-end overflow-hidden"
                  style={{ "--tone": s.color } as React.CSSProperties}
                >
                  <Image
                    src={SPHERE_VISUELS[s.slug]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="lift-img object-cover"
                  />
                  <span aria-hidden="true" className="absolute right-2.5 top-2.5 h-4 w-4 rounded-full border-[3px] border-encre" style={{ background: s.color }} />
                  <span className="relative m-2.5 inline-flex flex-col self-start rounded-xl border-[3px] border-encre bg-white px-3 py-1.5 shadow-[2px_2px_0_0_var(--color-encre)]">
                    <span className="font-display text-base font-extrabold leading-tight">{s.label}</span>
                    <span className="text-xs font-semibold text-encre/70">
                      {perSphere.get(s.slug) ? `${perSphere.get(s.slug)} parcours` : "Bientôt"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Derniers parcours */}
        <section aria-labelledby="titre-derniers" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="titre-derniers" className="text-3xl sm:text-4xl">
              Derniers parcours publiés
            </h2>
            <Link href="/formations" className="btn btn-blanc">
              Voir toutes les formations
            </Link>
          </div>
          {latest.length ? (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((p) => (
                <li key={p.id}>
                  <ProgramCard p={p} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="brut mt-6 flex flex-col items-center gap-4 bg-white p-8 text-center sm:flex-row sm:text-left">
              <Mascotte score={10} className="h-24 w-24 shrink-0" />
              <div>
                <p className="font-display text-2xl font-extrabold">Les premières fiches arrivent.</p>
                <p className="mt-1">
                  L&apos;annuaire ouvre en novembre 2026. Vous êtes un organisme&nbsp;?{" "}
                  <Link href="/publier" className="font-semibold underline underline-offset-4">
                    Publiez vos parcours parmi les premiers
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Comment ça marche, apprenant */}
        <section aria-labelledby="titre-comment" className="mt-14 grid gap-5 md:grid-cols-[1fr_1fr_1fr]">
          <h2 id="titre-comment" className="sr-only">
            Comment trouver une formation
          </h2>
          {[
            ["Cherchez", "Un métier, une compétence, une langue. Filtrez par thème, ville, modalité ou CPF."],
            ["Comparez", "Chaque fiche affiche en haut la durée, le prix, la modalité et l'organisme."],
            ["Contactez", "Écrivez à l'organisme en trois champs, sans créer de compte, ou ouvrez le programme complet sur son site."],
          ].map(([t, d], i) => (
            <div key={t} className={`brut p-6 ${i === 1 ? "bg-vif text-white" : "bg-white"}`}>
              <p className="font-display text-5xl font-extrabold" aria-hidden="true">
                {i + 1}
              </p>
              <h3 className="mt-2 text-2xl">{t}</h3>
              <p className={`mt-2 ${i === 1 ? "text-white/90" : "text-encre/80"}`}>{d}</p>
            </div>
          ))}
        </section>

        {/* Bloc éditorial : à quoi sert l'annuaire (apprenants et organismes) */}
        <section aria-labelledby="titre-guide" className="mt-14">
          <h2 id="titre-guide" className="max-w-4xl text-3xl sm:text-4xl">{ACCUEIL_GUIDE.titre}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {[ACCUEIL_GUIDE.apprenants, ACCUEIL_GUIDE.organismes].map((b, i) => (
              <div key={b.titre} className="calm-card p-6">
                <h3 className="text-2xl">{b.titre}</h3>
                {b.paragraphes.map((t) => (
                  <p key={t.slice(0, 20)} className="mt-3">{t}</p>
                ))}
                <p className="mt-4">
                  {i === 0 ? (
                    <Link href="/formations" className="font-semibold underline underline-offset-4">Rechercher une formation</Link>
                  ) : (
                    <Link href="/publier" className="font-semibold underline underline-offset-4">Référencer mes formations</Link>
                  )}
                  {" · "}
                  <Link href="/a-propos" className="underline underline-offset-4">Notre méthode</Link>
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-14">
          <Faq id="titre-faq-accueil" items={ACCUEIL_FAQ} />
        </div>
      </div>
    </div>
  );
}
