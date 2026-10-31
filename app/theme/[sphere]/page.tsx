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
            <Link href="/publier" className="font-semibold underline underline-offset-4">Référencez-la gratuitement</Link>.
          </p>
        </aside>
      </section>
      <Faq id="t-faq-theme" titre={`Questions fréquentes : ${s.label.toLowerCase()}`} items={c.faq} />
    </ListingPage>
  );
}
