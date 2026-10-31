import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrganization, programsByOrg } from "@/lib/data";
import { outboundRel } from "@/lib/regles";
import { orgJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProgramCard } from "@/components/ProgramCard";
import { GroupBadge } from "@/components/GroupBadge";

export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const o = await getOrganization(slug);
  if (!o) return { title: "Organisme introuvable", robots: { index: false } };
  const programs = await programsByOrg(o.id);
  const indexable = programs.some((p) => p.indexable);
  return {
    title: `${o.name} : parcours de formation`,
    description: (o.description ?? `Les parcours de formation proposés par ${o.name}${o.city ? ` (${o.city})` : ""}.`).slice(0, 158),
    alternates: { canonical: `/organisme/${o.slug}` },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default async function OrganismePage({ params }: { params: Params }) {
  const { slug } = await params;
  const o = await getOrganization(slug);
  if (!o) notFound();
  const programs = await programsByOrg(o.id);
  return (
    <>
      <section className="dots border-b-[3px] border-encre">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Breadcrumbs items={[{ href: "/formations", label: "Formations" }, { label: o.name }]} />
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            {o.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={o.logo_url} alt={`Logo ${o.name}`} className="brut-sm h-24 w-24 bg-white object-contain p-2" />
            )}
            <div>
              <h1 className="text-4xl sm:text-5xl">{o.name}</h1>
              <p className="mt-2 text-lg">
                {[o.city, o.region].filter(Boolean).join(", ")}
                {o.qualiopi ? (o.city ? ". Certifié Qualiopi." : "Certifié Qualiopi.") : ""}
              </p>
            </div>
          </div>
          {o.description && <p className="mt-5 max-w-2xl text-lg">{o.description}</p>}
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {o.nda && (
              <div>
                <dt className="inline font-semibold">Déclaration d&apos;activité : </dt>
                <dd className="inline">{o.nda}</dd>
              </div>
            )}
            {o.siret && (
              <div>
                <dt className="inline font-semibold">SIRET : </dt>
                <dd className="inline">{o.siret}</dd>
              </div>
            )}
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {o.website && (
              <a href={o.website} target="_blank" rel={outboundRel(o.link_rel)} className="btn btn-jaune">
                Visiter le site de l&apos;organisme<span className="sr-only"> (nouvel onglet)</span>
              </a>
            )}
          </div>
          {o.is_group && <div className="mt-4 max-w-xl"><GroupBadge /></div>}
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-3xl">{programs.length} parcours publié{programs.length > 1 ? "s" : ""}</h2>
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <li key={p.id}>
              <ProgramCard p={p} />
            </li>
          ))}
        </ul>
      </div>
      <JsonLd data={orgJsonLd(o)} />
    </>
  );
}
