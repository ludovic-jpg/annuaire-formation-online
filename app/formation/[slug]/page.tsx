import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProgram, relatedPrograms } from "@/lib/data";
import { titreFiche, descriptionFiche } from "@/lib/seo";
import { ProgramCard } from "@/components/ProgramCard";
import { programRobots, outboundRel } from "@/lib/regles";
import { SPHERE_BY_SLUG, modaliteLabel } from "@/lib/spheres";
import { programImage } from "@/lib/visuels";
import { courseJsonLd } from "@/lib/jsonld";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ContactForm } from "@/components/ContactForm";
import { GroupBadge } from "@/components/GroupBadge";
import { MobileContactBar } from "@/components/MobileContactBar";
import type { AlsoOffered } from "@/lib/types";
import { slugify } from "@/lib/slug";
import { renderMarkdownSur } from "@/lib/blog";
import "../../blog/blog.css";

export const revalidate = 300;
export async function generateStaticParams() {
  return [];
}

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProgram(slug);
  if (!p) return { title: "Formation introuvable", robots: { index: false } };
  const desc = descriptionFiche(p);
  const img = programImage(p);
  return {
    title: titreFiche(p.title, p.organizations.name),
    description: desc,
    alternates: { canonical: `/formation/${p.slug}` },
    robots: programRobots(p),
    openGraph: { title: p.title, description: desc, type: "website", url: `/formation/${p.slug}`, images: [{ url: img }] },
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
  const voisins = p.sphere ? await relatedPrograms(p.sphere, p.id, 3) : [];

  const facts: [string, string][] = [
    ["Durée", p.duration_text || "Non précisée"],
    ["Prix", p.price_text || "Sur demande"],
    ["Modalité", modaliteLabel(p.modality) + (p.city && p.modality !== "distanciel" ? `, ${p.city}` : "")],
    ["Organisme", org.name],
  ];
  if (p.level_text) facts.splice(3, 0, ["Niveau", p.level_text]);

  const reecrit = Boolean(p.rewritten_at);
  const lienSource = p.source_url
    ? `${p.title_source || p.title} sur ${org.name}`
    : "";
  const objectifsOrigine = p.objectives_source && p.objectives_source.length ? p.objectives_source : p.objectives;
  const plein = (t?: string | null) => Boolean(t && t.trim());
  // Rubriques obligatoires : toujours présentes, dans l'ordre de la matrice ; texte d'origine repris tel quel.
  const sectionsFiche: { id: string; titre: string; texte?: string | null; md?: string | null; liste?: string[]; vide?: boolean }[] = [
    { id: "objectifs", titre: "Objectifs pédagogiques", liste: objectifsOrigine?.length ? objectifsOrigine : undefined, vide: !objectifsOrigine?.length },
    { id: "public", titre: "Public visé", texte: p.audience, vide: !plein(p.audience) },
    { id: "prerequis", titre: "Prérequis", texte: p.prerequisites, vide: !plein(p.prerequisites) },
    ...(plein(p.highlights) ? [{ id: "points-forts", titre: "Points forts de la formation", texte: p.highlights }] : []),
    { id: "modalites", titre: "Modalités pédagogiques", texte: p.modalities_text, vide: !plein(p.modalities_text) },
    { id: "programme", titre: "Programme pédagogique", md: p.program_md, vide: !plein(p.program_md) },
    ...(plein(p.results_expected) ? [{ id: "resultats", titre: "Résultats attendus", texte: p.results_expected }] : []),
    { id: "evaluation", titre: "Modalités d'évaluation", texte: p.evaluation, vide: !plein(p.evaluation) },
    { id: "accessibilite", titre: "Accessibilité", texte: p.accessibility, vide: !plein(p.accessibility) },
    { id: "delais", titre: "Délais d'accès", texte: p.access_delay, vide: !plein(p.access_delay) },
    ...(Array.isArray(p.extra_sections) ? p.extra_sections : []).filter((x) => plein(x.contenu)).map((x, i) => ({ id: `autre-${i}`, titre: x.rubrique, texte: x.contenu })),
  ];

  return (
    <>
      <section className="dots border-b-4 border-encre">
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
                  <div key={k} className={`p-4 ${i % 2 === 0 ? "border-r-[3px]" : "sm:border-r-[3px]"} ${i < 2 ? "border-b-4 sm:border-b-0" : ""} border-encre last:border-r-0`}>
                    <dt className="text-xs font-semibold text-encre/70">{k}</dt>
                    <dd className="mt-1 font-display text-lg font-extrabold leading-tight">
                      {k === "Organisme" ? <Link href={`/organisme/${org.slug}`} className="underline decoration-2 underline-offset-4">{v}</Link> : v}
                    </dd>
                  </div>
                ))}
              </dl>
              {org.is_group && <div className="mt-3"><GroupBadge /></div>}
            </div>
            <div className="brut visual-tint relative aspect-[4/3] overflow-hidden" style={{ "--tone": sphere?.color ?? "#FFCD1C" } as React.CSSProperties}>
              {img.startsWith("/") ? (
                <Image src={img} alt={`Visuel de la formation ${p.title}, proposée par ${org.name}`} fill loading="eager" fetchPriority="high" sizes="(min-width: 1024px) 40vw, 100vw" className="object-contain p-4" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={`Visuel de la formation ${p.title}, proposée par ${org.name}`} className="absolute inset-0 h-full w-full object-contain p-4" />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          {reecrit && p.lead_text && (
            <div className="mb-8 max-w-prose">
              <p className="text-xl font-semibold">{p.lead_text}</p>
              {p.source_url && (
                <p className="mt-3 text-lg">
                  Parcours proposé par {org.name} :{" "}
                  <a href={p.source_url} target="_blank" rel={rel} className="font-semibold underline decoration-2 underline-offset-4">
                    {lienSource}
                  </a>
                  <span className="sr-only"> (nouvel onglet)</span>.
                </p>
              )}
            </div>
          )}
          {p.summary && (
            <section aria-labelledby="t-res" className="mb-10">
              <h2 id="t-res" className="text-3xl">En résumé</h2>
              <p className="mt-4 max-w-prose text-lg">{p.summary}</p>
            </section>
          )}

          <p className="mb-8 max-w-prose rounded-2xl border-4 border-encre bg-jaune-pale p-4 text-base">
            Les rubriques ci-dessous reprennent le texte complet publié par {org.name}, sans modification.
          </p>

          {p.short_objective && (
            <p className="mb-8 max-w-prose rounded-2xl border-4 border-encre bg-jaune-pale p-4 text-lg font-semibold">
              <span className="block text-xs font-bold uppercase tracking-wide text-encre/70">Objectif</span>
              {p.short_objective}
            </p>
          )}
          {sectionsFiche.map((r) => (
            <section key={r.id} aria-labelledby={`t-${r.id}`} className="mt-10 first:mt-0">
              <h2 id={`t-${r.id}`} className="text-3xl">{r.titre}</h2>
              {r.liste ? (
                <ul className="mt-4 grid gap-2">
                  {r.liste.map((o, i) => (
                    <li key={i} className="flex gap-3 rounded-xl bg-creme p-3">
                      <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true">
                        <circle cx="12" cy="12" r="11" fill="#FFCD1C" stroke="#0D1240" strokeWidth="2" />
                        <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#0D1240" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              ) : r.vide ? (
                <p className="mt-4 max-w-prose text-lg text-encre/70">Non communiqué par l&apos;organisme sur sa page.</p>
              ) : (
                <div className="prose-af mt-4 max-w-prose text-lg" dangerouslySetInnerHTML={{ __html: renderMarkdownSur((r.md || r.texte) ?? "") }} />
              )}
            </section>
          ))}

          {p.source_url && (
            <a href={p.source_url} target="_blank" rel={rel} className="btn btn-jaune mt-10 text-lg">
              Voir la page du parcours sur le site de l&apos;organisme
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

      <section aria-labelledby="t-plus" className="mx-auto max-w-6xl px-4 pb-4">
        <h2 id="t-plus" className="text-3xl">Pour comparer</h2>
        <p className="mt-3 max-w-prose text-lg">
          {sphere ? (
            <>
              Ce parcours fait partie du thème{" "}
              <Link href={`/theme/${sphere.slug}`} className="font-semibold underline underline-offset-4">{sphere.label.toLowerCase()}</Link>
              , où vous trouverez un guide pour bien choisir et les autres parcours référencés.{" "}
            </>
          ) : null}
          Retrouvez aussi{" "}
          <Link href={`/organisme/${org.slug}`} className="font-semibold underline underline-offset-4">tous les parcours de {org.name}</Link>
          {p.city && p.modality !== "distanciel" ? (
            <>
              {" "}et les{" "}
              <Link href={`/ville/${slugify(p.city)}`} className="font-semibold underline underline-offset-4">formations à {p.city}</Link>
            </>
          ) : null}
          .
        </p>
        {voisins.length > 0 && (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Autres parcours du même thème">
            {voisins.map((v) => (
              <li key={v.id}>
                <ProgramCard p={v} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <MobileContactBar orgName={org.name} sourceUrl={p.source_url} rel={rel} />
      <JsonLd data={courseJsonLd(p)} />
    </>
  );
}
