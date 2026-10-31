import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram } from "@/lib/data";
import { programRobots, outboundRel } from "@/lib/regles";
import { SPHERE_BY_SLUG, modaliteLabel } from "@/lib/spheres";
import { programImage } from "@/lib/visuels";
import { courseJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { GroupBadge } from "@/components/GroupBadge";
import type { AlsoOffered } from "@/lib/types";

export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProgram(slug);
  if (!p) return { title: "Formation introuvable", robots: { index: false } };
  const desc = (p.summary ?? `${p.title} par ${p.organizations.name}`).slice(0, 158);
  const img = programImage(p);
  return {
    title: `${p.title} : ${p.organizations.name}`,
    description: desc,
    alternates: { canonical: `/formation/${p.slug}` },
    robots: programRobots(p),
    openGraph: { title: p.title, description: desc, type: "article", images: [{ url: img }] },
  };
}

export default async function FormationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const p = await getProgram(slug);
  if (!p) notFound();
  const sphere = p.sphere ? SPHERE_BY_SLUG[p.sphere] : undefined;
  const org = p.organizations;
  const rel = outboundRel(org.link_rel);
  const img = programImage(p);
  const twins = (Array.isArray(p.also_offered_by) ? p.also_offered_by : []) as AlsoOffered[];

  const facts: [string, string][] = [
    ["Durée", p.duration_text || "Non précisée"],
    ["Prix", p.price_text || "Sur demande"],
    ["Modalité", modaliteLabel(p.modality) + (p.city && p.modality !== "distanciel" ? `, ${p.city}` : "")],
    ["Organisme", org.name],
  ];

  return (
    <>
      <section className="dots border-b-[3px] border-encre">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Breadcrumbs
            items={[
              { href: "/formations", label: "Formations" },
              ...(sphere ? [{ href: `/theme/${sphere.slug}`, label: sphere.label }] : []),
              { label: p.title },
            ]}
          />
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="flex flex-wrap gap-2">
                {p.cpf_eligible && <span className="chip bg-menthe/30">Éligible CPF</span>}
                {p.certification && <span className="chip !bg-jaune">Certifiant {p.certification}</span>}
                {org.qualiopi && <span className="chip">Organisme certifié Qualiopi</span>}
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl">{p.title}</h1>
              <dl className="brut mt-6 grid grid-cols-2 overflow-hidden bg-white sm:grid-cols-4">
                {facts.map(([k, v], i) => (
                  <div key={k} className={`p-4 ${i % 2 === 0 ? "border-r-[3px]" : "sm:border-r-[3px]"} ${i < 2 ? "border-b-[3px] sm:border-b-0" : ""} border-encre last:border-r-0`}>
                    <dt className="text-xs font-semibold text-encre/70">{k}</dt>
                    <dd className="mt-1 font-display text-lg font-extrabold leading-tight">
                      {k === "Organisme" ? <Link href={`/organisme/${org.slug}`} className="underline decoration-2 underline-offset-4">{v}</Link> : v}
                    </dd>
                  </div>
                ))}
              </dl>
              {org.is_group && <div className="mt-3"><GroupBadge /></div>}
            </div>
            <div className="brut relative aspect-[4/3] overflow-hidden" style={{ background: sphere?.color ?? "#FFCD1C" }}>
              {img.startsWith("/") ? (
                <Image src={img} alt="" fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain p-4" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {p.objectives?.length > 0 && (
            <section aria-labelledby="t-obj">
              <h2 id="t-obj" className="text-3xl">Objectifs</h2>
              <ul className="mt-4 grid gap-2">
                {p.objectives.map((o, i) => (
                  <li key={i} className="flex gap-3 rounded-xl bg-creme p-3">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
                      <circle cx="12" cy="12" r="11" fill="#FFCD1C" stroke="#0D1240" strokeWidth="2" />
                      <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#0D1240" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {p.summary && (
            <section aria-labelledby="t-res" className="mt-10">
              <h2 id="t-res" className="text-3xl">En résumé</h2>
              <p className="mt-4 max-w-prose text-lg">{p.summary}</p>
            </section>
          )}
          <section aria-labelledby="t-pub" className="mt-10 grid gap-4 sm:grid-cols-2">
            <h2 id="t-pub" className="sr-only">Public et prérequis</h2>
            <div className="calm-card p-5">
              <h3 className="text-lg">Public visé</h3>
              <p className="mt-2">{p.audience || "Non précisé par l'organisme."}</p>
            </div>
            <div className="calm-card p-5">
              <h3 className="text-lg">Prérequis</h3>
              <p className="mt-2">{p.prerequisites || "Non précisé par l'organisme."}</p>
            </div>
          </section>

          {p.source_url && (
            <a href={p.source_url} target="_blank" rel={rel} className="btn btn-jaune mt-10 text-lg">
              Voir le programme complet sur le site de l&apos;organisme
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          )}

          {twins.length > 0 && (
            <section aria-labelledby="t-aussi" className="mt-10">
              <h2 id="t-aussi" className="text-2xl">Aussi proposé par</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {twins.map((t) => (
                  <li key={t.url}>
                    <a href={t.url} target="_blank" rel={outboundRel(t.rel ?? org.link_rel)} className="chip hover:bg-jaune-pale">
                      {t.name}
                    </a>
                  </li>
                ))}
              </ul>
              {org.is_group && (
                <p className="hint mt-2">Ces organismes appartiennent au même groupe que l&apos;éditeur de l&apos;annuaire.</p>
              )}
            </section>
          )}
        </div>

        <aside aria-labelledby="t-contact" className="lg:sticky lg:top-24 lg:self-start">
          <div className="calm-card p-5 sm:p-6">
            <h2 id="t-contact" className="text-2xl">Contacter l&apos;organisme</h2>
            <p className="hint mt-1 mb-4">Trois champs, sans création de compte.</p>
            <ContactForm programId={p.id} orgName={org.name} />
          </div>
        </aside>
      </div>
      <JsonLd data={courseJsonLd(p)} />
    </>
  );
}
