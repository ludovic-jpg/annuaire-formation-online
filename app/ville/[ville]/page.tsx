import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { programsByCitySlug } from "@/lib/data";
import { isListingIndexable } from "@/lib/regles";
import { slugify } from "@/lib/slug";
import { ListingPage } from "@/components/ListingPage";
import Link from "next/link";
import { SPHERE_BY_SLUG } from "@/lib/spheres";

export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}
type Params = Promise<{ ville: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { ville } = await params;
  const { city, programs } = await programsByCitySlug(ville, slugify);
  if (!city) return { robots: { index: false } };
  return {
    title: `Formations professionnelles à ${city} : ${programs.length} parcours`,
    description: `Formations professionnelles en présentiel ou en mixte à ${city} : ${programs.length} parcours comparés par durée, prix, modalité, CPF et organisme.`,
    alternates: { canonical: `/ville/${ville}` },
    robots: isListingIndexable(programs) ? undefined : { index: false, follow: true },
  };
}

export default async function VillePage({ params }: { params: Params }) {
  const { ville } = await params;
  const { city, programs } = await programsByCitySlug(ville, slugify);
  if (!city) notFound();
  const themes = [...new Set(programs.map((p) => p.sphere).filter((x): x is string => Boolean(x && SPHERE_BY_SLUG[x])))].map((x) => SPHERE_BY_SLUG[x]);
  return (
    <ListingPage
      title={`Formations à ${city}`}
      intro={`Les parcours de formation en présentiel ou en mixte proposés à ${city} par les organismes référencés. Les formations à distance sont accessibles depuis toutes les villes, retrouvez-les dans la recherche.`}
      crumbs={[{ href: "/formations", label: "Formations" }, { label: city }]}
      programs={programs}
      color="#FFCD1C"
      titreListe={`Les parcours proposés à ${city}`}
    >
      {themes.length > 0 && (
        <section aria-labelledby="t-themes-ville" className="max-w-prose">
          <h2 id="t-themes-ville" className="text-3xl">Par thème</h2>
          <p className="mt-3 text-lg">
            Les parcours de {city} relèvent des thèmes suivants :{" "}
            {themes.map((t, i) => (
              <span key={t.slug}>
                {i > 0 && ", "}
                <Link href={`/theme/${t.slug}`} className="font-semibold underline underline-offset-4">{t.label.toLowerCase()}</Link>
              </span>
            ))}
            . Chaque page thème donne des repères pour bien choisir.
          </p>
        </section>
      )}
    </ListingPage>
  );
}
