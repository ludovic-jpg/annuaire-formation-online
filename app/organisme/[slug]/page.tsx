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
import { orgPostsParOrganisme } from "@/lib/posts";
import { formaterDate } from "@/lib/blog";
import { jourIso } from "@/lib/articles";
import { postsVisibles } from "@/lib/blog";
import { modaliteLabel } from "@/lib/spheres";

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
  const [programs, articles] = await Promise.all([programsByOrg(o.id), orgPostsParOrganisme(o.id)]);
  const themes = [...new Set(programs.map((p) => p.sphere).filter((x): x is string => Boolean(x && SPHERE_BY_SLUG[x])))].map((x) => SPHERE_BY_SLUG[x]);
  const articlesMarque = postsVisibles().filter((a) => a.org === o.slug);
  const nbCpf = programs.filter((p) => p.cpf_eligible).length;
  const certifs: string[] = [...new Set(programs.map((p) => p.certification as string | null).filter((x): x is string => Boolean(x)))];
  const modalites = [...new Set(programs.map((p) => (p.modality ? modaliteLabel(p.modality).toLowerCase() : "")).filter(Boolean))];
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
        <section aria-labelledby="t-lire-org" className="mt-12 max-w-prose">
          <h2 id="t-lire-org" className="text-3xl">Bien choisir une formation chez {o.name}</h2>
          <p className="mt-3">
            {o.name} propose {programs.length} parcours référencés dans l&apos;annuaire
            {themes.length > 0 ? `, dans ${themes.length > 1 ? "les thèmes" : "le thème"} ${themes.map((t) => t.label.toLowerCase()).join(", ")}` : ""}.
            {modalites.length > 0 ? ` Les modalités proposées : ${modalites.join(", ")}.` : ""}
            {nbCpf > 0 ? ` ${nbCpf} parcours ${nbCpf > 1 ? "sont" : "est"} annoncé${nbCpf > 1 ? "s" : ""} éligible${nbCpf > 1 ? "s" : ""} au CPF.` : " Aucun parcours n'est annoncé éligible au CPF sur cette page."}
            {certifs.length > 0 ? ` Certification visée : ${certifs.join(", ")}.` : ""}
          </p>
          <p className="mt-3">
            Avant de choisir, ouvrez la fiche du parcours : elle reprend le texte complet publié par l&apos;organisme (objectifs, public, prérequis, programme,
            évaluation, accessibilité, délais d&apos;accès). Comparez ensuite avec d&apos;autres organismes sur la page du thème, puis contactez {o.name} depuis le
            formulaire de la fiche pour confirmer dates, prix et financement. Pour comprendre l&apos;ordre des résultats, lisez{" "}
            <Link href="/comment-fonctionne-le-classement" className="font-semibold underline underline-offset-4">comment fonctionne le classement</Link>.
          </p>
        </section>
        {articlesMarque.length > 0 && (
          <section aria-labelledby="t-articles-marque" className="mt-12">
            <h2 id="t-articles-marque" className="text-3xl">À lire : le guide de {o.name}</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {articlesMarque.map((a) => (
                <li key={a.slug} className="calm-card p-5">
                  <h3 className="font-display text-xl">
                    <Link href={`/blog/${a.slug}`} className="tap hover:underline underline-offset-4">{a.title}</Link>
                  </h3>
                  {a.description && <p className="mt-2 text-encre/85">{a.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {articles.length > 0 && (
          <section aria-labelledby="t-articles" className="mt-12">
            <h2 id="t-articles" className="text-3xl">
              Article{articles.length > 1 ? "s" : ""} de {o.name}
            </h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {articles.map((a) => {
                const jour = jourIso(a.published_at ?? a.updated_at);
                return (
                  <li key={a.id} className="calm-card p-5">
                    <p className="text-sm text-encre/70">
                      <time dateTime={jour}>{formaterDate(jour)}</time>
                    </p>
                    <h3 className="mt-1 font-display text-xl">
                      <Link href={`/blog/${a.slug}`} className="tap hover:underline underline-offset-4">
                        {a.title}
                      </Link>
                    </h3>
                    {a.description && <p className="mt-2 text-encre/85">{a.description}</p>}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
      <JsonLd data={orgJsonLd(o)} />
    </>
  );
}
