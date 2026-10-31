import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrganization, programsByOrg } from "@/lib/data";
import { outboundRel } from "@/lib/regles";
import { orgJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProgramCard } from "@/components/ProgramCard";
import { GroupBadge } from "@/components/GroupBadge";
import Link from "next/link";
import { SPHERE_BY_SLUG } from "@/lib/spheres";
import { couper } from "@/lib/seo";

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
  const n = programs.length;
  const lieu = o.city ? ` (${o.city})` : "";
  return {
    title: `${o.name} : ${n} parcours de formation`,
    description: couper(
      `${o.name}${lieu}, organisme de formation${o.qualiopi ? " certifié Qualiopi" : ""} : ${n} parcours référencés avec durée, prix et modalité. ${o.description ?? ""}`,
      158,
    ),
    alternates: { canonical: `/organisme/${o.slug}` },
    robots: indexable ? undefined : { index: false, follow: true },
  };
}

export default async function OrganismePage({ params }: { params: Params }) {
  const { slug } = await params;
  const o = await getOrganization(slug);
  if (!o) notFound();
  const programs = await programsByOrg(o.id);
  const themes = [...new Set(programs.map((p) => p.sphere).filter((x): x is string => Boolean(x && SPHERE_BY_SLUG[x])))].map((x) => SPHERE_BY_SLUG[x]);
  return (
    <>
      <section className="dots border-b-4 border-encre">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Breadcrumbs items={[{ href: "/formations", label: "Formations" }, { label: o.name }]} />
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
            {o.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={o.logo_url} alt={`Logo ${o.name}`} width={96} height={96} className="brut-sm h-24 w-24 bg-white object-contain p-2" />
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
        <h2 className="text-3xl">
          {programs.length} parcours de {o.name} publié{programs.length > 1 ? "s" : ""}
        </h2>
        {themes.length > 0 && (
          <p className="mt-3 max-w-prose">
            Thèmes couverts :{" "}
            {themes.map((t, i) => (
              <span key={t.slug}>
                {i > 0 && ", "}
                <Link href={`/theme/${t.slug}`} className="font-semibold underline underline-offset-4">{t.label.toLowerCase()}</Link>
              </span>
            ))}
            . Chaque page thème compare ces parcours avec ceux des autres organismes.
          </p>
        )}
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
