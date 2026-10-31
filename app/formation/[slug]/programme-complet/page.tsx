import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram } from "@/lib/data";
import { rubriquesIntegrales } from "@/lib/fiche-rubriques";
import { renderMarkdownSur } from "@/lib/blog";
import { outboundRel } from "@/lib/regles";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import "../../../blog/blog.css";

export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}
type Params = Promise<{ slug: string }>;

// Texte d'origine de l'organisme : consultable, jamais indexé (la fiche principale porte le contenu original).
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProgram(slug);
  return { title: p ? `Programme complet : ${p.title}` : "Programme introuvable", robots: { index: false, follow: true } };
}

export default async function ProgrammeCompletPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProgram(slug);
  if (!p) notFound();
  const rubriques = rubriquesIntegrales(p);
  const rel = outboundRel(p.organizations.link_rel);
  const objectifs = p.objectives_source && p.objectives_source.length ? p.objectives_source : p.objectives;
  return (
    <>
      <PageHero title={p.title_source || p.title} intro={<p className="text-base">Texte d&apos;origine repris de la page de {p.organizations.name}.</p>} tone="blanc">
        <Breadcrumbs items={[{ href: "/formations", label: "Formations" }, { href: `/formation/${p.slug}`, label: p.title }, { label: "Programme complet" }]} />
      </PageHero>
      <div className="mx-auto max-w-3xl px-4 py-10">
        {objectifs?.length > 0 && (
          <section aria-labelledby="t-o">
            <h2 id="t-o" className="text-3xl">Objectifs pédagogiques</h2>
            <ul className="prose-af mt-4 text-lg">
              {objectifs.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </section>
        )}
        {rubriques.map((r) => (
          <section key={r.id} aria-labelledby={`t-${r.id}`} className="mt-10">
            <h2 id={`t-${r.id}`} className="text-3xl">{r.titre}</h2>
            <div className="prose-af mt-4 text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdownSur((r.md || r.texte) ?? "") }} />
          </section>
        ))}
        <p className="mt-12 flex flex-wrap gap-4 text-lg">
          <Link href={`/formation/${p.slug}`} className="btn btn-blanc">Retour à la fiche</Link>
          {p.source_url && (
            <a href={p.source_url} target="_blank" rel={rel} className="btn btn-jaune">
              Voir la page chez {p.organizations.name}
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          )}
        </p>
      </div>
    </>
  );
}
