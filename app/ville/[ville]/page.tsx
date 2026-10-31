import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { programsByCitySlug } from "@/lib/data";
import { isListingIndexable } from "@/lib/regles";
import { slugify } from "@/lib/slug";
import { ListingPage } from "@/components/ListingPage";

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
    title: `Formations à ${city}`,
    description: `Les parcours de formation professionnelle proposés à ${city} : durée, prix, modalité et organismes.`,
    alternates: { canonical: `/ville/${ville}` },
    robots: isListingIndexable(programs) ? undefined : { index: false, follow: true },
  };
}

export default async function VillePage({ params }: { params: Params }) {
  const { ville } = await params;
  const { city, programs } = await programsByCitySlug(ville, slugify);
  if (!city) notFound();
  return (
    <ListingPage
      title={`Formations à ${city}`}
      intro={`Les parcours de formation en présentiel ou en mixte proposés à ${city} par les organismes référencés. Les formations à distance sont accessibles depuis toutes les villes, retrouvez-les dans la recherche.`}
      crumbs={[{ href: "/formations", label: "Formations" }, { label: city }]}
      programs={programs}
      color="#FFCD1C"
    />
  );
}
