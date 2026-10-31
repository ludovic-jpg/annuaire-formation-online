import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SPHERES, SPHERE_BY_SLUG } from "@/lib/spheres";
import { SPHERE_VISUELS } from "@/lib/visuels";
import { programsBySphere } from "@/lib/data";
import { isListingIndexable } from "@/lib/regles";
import { themeContenu } from "@/lib/contenu/themes";
import { ListingPage } from "@/components/ListingPage";
import { Faq } from "@/components/Faq";
import Image from "next/image";
import { ProgramCard } from "@/components/ProgramCard";
import { LOGOS_GROUPE } from "@/lib/visuels";

// Marque spécialiste de chaque thème : mise en avant dédiée en tête de page
const SPECIALISTES: Record<string, { org: string; logo: string; accroche: string }> = {
  "comptabilite-finance": { org: "formacompta", logo: "FormaCompta", accroche: "La marque spécialisée du groupe en comptabilité, paie et gestion financière." },
  langues: { org: "formalangue", logo: "FormaLangue", accroche: "La marque spécialisée du groupe en langues professionnelles." },
  "management-rh": { org: "formarh", logo: "FormaRH", accroche: "La marque spécialisée du groupe en management et ressources humaines." },
  "digital-bureautique": { org: "formadigital", logo: "FormaDigital", accroche: "La marque spécialisée du groupe en bureautique et outils numériques." },
  "vente-commerce": { org: "formavente", logo: "FormaVente", accroche: "La marque spécialisée du groupe en vente et relation commerciale." },
  "bien-etre-massage": { org: "formabienetre", logo: "FormaBienêtre", accroche: "La marque spécialisée du groupe en bien-être et massage." },
  "bilan-de-competences": { org: "bilandecompetence-pro", logo: "Bilan de compétences", accroche: "Le bilan de compétences du groupe, en formules finançables selon éligibilité." },
};

export const revalidate = 300;
export const dynamicParams = false;
export function generateStaticParams() {
  return SPHERES.map((s) => ({ sphere: s.slug }));
}
type Params = Promise<{ sphere: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { sphere } = await params;
  const s = SPHERE_BY_SLUG[sphere];
  const c = themeContenu(sphere);
  if (!s || !c) return {};
  const programs = await programsBySphere(sphere);
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: { canonical: `/theme/${s.slug}` },
    openGraph: { title: c.h1, description: c.metaDescription, url: `/theme/${s.slug}`, images: [{ url: SPHERE_VISUELS[s.slug] }] },
    robots: isListingIndexable(programs) ? undefined : { index: false, follow: true },
  };
}

export default async function ThemePage({ params }: { params: Params }) {
  const { sphere } = await params;
  const s = SPHERE_BY_SLUG[sphere];
  const c = themeContenu(sphere);
  if (!s || !c) notFound();
  const programs = await programsBySphere(sphere);

  // Organismes présents dans le thème (maillage thème → organisme)
  const orgs = [...new Map(programs.map((p) => [p.organizations.slug, p.organizations.name])).entries()];
  const spec = SPECIALISTES[sphere];
  const specFiches = spec ? programs.filter((p) => p.organizations.slug === spec.org) : [];
  const specLogo = spec ? LOGOS_GROUPE.find((l) => l.name === spec.logo) : undefined;
  const voisins = c.voisins.map((v) => SPHERE_BY_SLUG[v]).filter(Boolean);

  return (
    <ListingPage
      title={c.h1}
      intro={c.accroche}
      crumbs={[{ href: "/formations", label: "Formations" }, { label: s.label }]}
      programs={programs}
      color={s.color}
      image={SPHERE_VISUELS[s.slug]}
      titreListe={`Les parcours ${s.label.toLowerCase()} référencés`}
    >
      {spec && specFiches.length > 0 && (
        <section aria-labelledby="t-spec" className="brut mb-12 bg-jaune-pale p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-5">
            {specLogo && (
              <a href={specLogo.url} target="_blank" rel="sponsored noopener" className="brut-sm flex h-20 w-20 items-center justify-center bg-white p-2">
                <Image src={specLogo.src} alt={`Logo ${specFiches[0].organizations.name}`} width={specLogo.w} height={specLogo.h} className="max-h-16 w-auto object-contain" />
              </a>
            )}
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wide text-encre/70">Le spécialiste du thème</p>
              <h2 id="t-spec" className="text-3xl">{specFiches[0].organizations.name}</h2>
              <p className="mt-1 text-lg">{spec.accroche} {specFiches.length} parcours dans l&apos;annuaire.</p>
            </div>
            <Link href={`/organisme/${spec.org}`} className="btn btn-nuit ml-auto">Tous ses parcours</Link>
          </div>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {specFiches.slice(0, 6).map((p) => (
              <li key={p.id}><ProgramCard p={p} /></li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="t-guide" className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="max-w-prose">
          <h2 id="t-guide" className="text-3xl sm:text-4xl">{c.titreGuide}</h2>
          {c.guide.map((para, i) => (
            <p key={i} className="mt-4 text-lg">{para}</p>
          ))}
        </div>
        <aside aria-label="Pour aller plus loin" className="calm-card self-start p-5 sm:p-6">
          {orgs.length > 0 && (
            <>
              <h3 className="text-lg">Organismes présents dans ce thème</h3>
              <ul className="mt-2 grid gap-1">
                {orgs.map(([slug, name]) => (
                  <li key={slug}>
                    <Link href={`/organisme/${slug}`} className="underline underline-offset-4">{name}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          {voisins.length > 0 && (
            <p className={orgs.length ? "mt-5" : ""}>
              Thèmes proches :{" "}
              {voisins.map((v, i) => (
                <span key={v.slug}>
                  {i > 0 && (i === voisins.length - 1 ? " et " : ", ")}
                  <Link href={`/theme/${v.slug}`} className="font-semibold underline underline-offset-4">
                    {v.label.toLowerCase()}
                  </Link>
                </span>
              ))}
              .
            </p>
          )}
          <p className="mt-5">
            Vous proposez une formation dans ce domaine&nbsp;?{" "}
            <Link href="/publier" className="font-semibold underline underline-offset-4">Référencez-la</Link>.
          </p>
        </aside>
      </section>
      <Faq id="t-faq-theme" titre={`Questions fréquentes : ${s.label.toLowerCase()}`} items={c.faq} />
    </ListingPage>
  );
}
