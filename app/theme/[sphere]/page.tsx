import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SPHERES, SPHERE_BY_SLUG } from "@/lib/spheres";
import { SPHERE_VISUELS } from "@/lib/visuels";
import { programsBySphere } from "@/lib/data";
import { isListingIndexable } from "@/lib/regles";
import { ListingPage } from "@/components/ListingPage";

export const revalidate = 300;
export const dynamicParams = false;
export function generateStaticParams() {
  return SPHERES.map((s) => ({ sphere: s.slug }));
}
type Params = Promise<{ sphere: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { sphere } = await params;
  const s = SPHERE_BY_SLUG[sphere];
  if (!s) return {};
  const programs = await programsBySphere(sphere);
  return {
    title: `Formations ${s.label.toLowerCase()}`,
    description: s.intro.slice(0, 158),
    alternates: { canonical: `/theme/${s.slug}` },
    robots: isListingIndexable(programs) ? undefined : { index: false, follow: true },
  };
}

export default async function ThemePage({ params }: { params: Params }) {
  const { sphere } = await params;
  const s = SPHERE_BY_SLUG[sphere];
  if (!s) notFound();
  const programs = await programsBySphere(sphere);
  return (
    <ListingPage
      title={`Formations ${s.label.toLowerCase()}`}
      intro={s.intro}
      crumbs={[{ href: "/formations", label: "Formations" }, { label: s.label }]}
      programs={programs}
      color={s.color}
      image={SPHERE_VISUELS[s.slug]}
    />
  );
}
