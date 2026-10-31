import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../blog.css";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/env";
import { EDITEUR_ID, SITE_ID, orgId } from "@/lib/jsonld";
import { faqDepuisMarkdown, formaterDate, postVisible, postsVisibles, renderMarkdown, renderMarkdownSur, tempsDeLecture } from "@/lib/blog";
import { orgPostPublie } from "@/lib/posts";
import { entreesBlog } from "@/lib/blog-unifie";
import { jourIso, normaliserCorps, reecrireLiensSortants, relDeLorganisme, type OrgPostPublic } from "@/lib/articles";

const MARQUES: Record<string, { name: string; url: string }> = {
  "back-to-business-formatrix": { name: "Formatrix", url: "https://formatrix.fr" },
  skills4mation: { name: "Skills4mation", url: "https://skills4mation.com" },
  formarh: { name: "FormaRH", url: "https://formarh.com" },
  formalangue: { name: "FormaLangue", url: "https://formalangue.com" },
  formadigital: { name: "FormaDigital", url: "https://formadigital.fr" },
  formavente: { name: "FormaVente", url: "https://formavente.fr" },
  formabienetre: { name: "FormaBienêtre", url: "https://formabientre.fr" },
  formacompta: { name: "FormaCompta", url: "https://formacompta.fr" },
  "bilandecompetence-pro": { name: "Bilan de compétences Pro", url: "https://bilandecompetence.pro" },
};

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  // Articles fichiers pré-rendus ; les articles d'organismes sont rendus à la demande puis mis en cache (ISR).
  return postsVisibles().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

/** Le fichier l'emporte en cas de slug identique. */
async function trouver(slug: string) {
  const fichier = postVisible(slug);
  if (fichier) return { fichier, org: null as OrgPostPublic | null };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const org = await orgPostPublie(slug);
  return org ? { fichier: null, org } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await trouver(slug);
  if (!t) return { title: "Article introuvable", robots: { index: false } };
  const url = `/blog/${slug}`;
  if (t.fichier) {
    const p = t.fichier;
    return {
      title: { absolute: p.seoTitle },
      description: p.description,
      alternates: { canonical: url },
      openGraph: {
        type: "article",
        title: p.seoTitle,
        description: p.description,
        url,
        publishedTime: p.date,
        ...(p.image ? { images: [{ url: p.image, alt: p.imageAlt }] } : {}),
      },
    };
  }
  const o = t.org!;
  const titre = o.seo_title || o.title;
  return {
    title: titre,
    description: o.description ?? undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: titre,
      description: o.description ?? undefined,
      url,
      publishedTime: o.published_at ?? undefined,
      modifiedTime: o.updated_at,
      authors: [o.organizations.name],
      ...(o.cover_url ? { images: [{ url: o.cover_url, alt: "" }] } : {}),
    },
  };
}

function faqJson(faq: { q: string; a: string }[]) {
  return faq.length
    ? [{ "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
    : [];
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const t = await trouver(slug);
  if (!t) notFound();
  const tous = await entreesBlog();
  const autres = tous.filter((x) => x.slug !== slug).slice(0, 3);
  const url = `${SITE_URL}/blog/${slug}`;

  let titre: string, date: string, corps: string, html: string;
  let jsonld: Record<string, unknown>;
  let org: OrgPostPublic["organizations"] | null = null;

  if (t.fichier) {
    const p = t.fichier;
    titre = p.title;
    date = p.date;
    corps = p.body;
    html = renderMarkdown(p.body);
    const marque = p.org ? MARQUES[p.org] : undefined;
    if (marque) {
      // Article de marque du groupe : liens sortants en rel="sponsored" (règle de liens de l'annuaire)
      org = { name: marque.name, slug: p.org, is_group: true, link_rel: "sponsored", logo_url: null, website: marque.url };
      html = reecrireLiensSortants(html, "sponsored", SITE_URL);
    }
    jsonld = {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      inLanguage: "fr-FR",
      mainEntityOfPage: url,
      url,
      ...(p.keyword ? { keywords: p.keyword } : {}),
      ...(p.image ? { image: p.image.startsWith("/") ? `${SITE_URL}${p.image}` : p.image } : {}),
      author: marque
        ? { "@type": "Organization", "@id": orgId(p.org), name: marque.name, url: `${SITE_URL}/organisme/${p.org}` }
        : { "@type": "Person", name: "Ludovic Albisser" },
      publisher: { "@id": EDITEUR_ID },
      isPartOf: { "@id": SITE_ID },
    };
  } else {
    const o = t.org!;
    org = o.organizations;
    titre = o.title;
    date = jourIso(o.published_at ?? o.updated_at);
    corps = normaliserCorps(o.body_md);
    html = reecrireLiensSortants(renderMarkdownSur(corps), relDeLorganisme(org), SITE_URL);
    jsonld = {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: o.title,
      ...(o.description ? { description: o.description } : {}),
      datePublished: o.published_at ?? date,
      dateModified: o.updated_at,
      inLanguage: "fr-FR",
      mainEntityOfPage: url,
      url,
      ...(o.keyword ? { keywords: o.keyword } : {}),
      ...(o.cover_url ? { image: o.cover_url } : {}),
      author: { "@type": "Organization", "@id": orgId(org.slug), name: org.name, url: `${SITE_URL}/organisme/${org.slug}` },
      publisher: { "@id": EDITEUR_ID },
      isPartOf: { "@id": SITE_ID },
    };
  }
  const faq = faqDepuisMarkdown(corps);

  return (
    <>
      <PageHero
        title={titre}
        intro={
          <p className="text-base">
            <time dateTime={date}>{formaterDate(date)}</time> · {tempsDeLecture(corps)} min de lecture
            {org && (
              <>
                {" "}· par{" "}
                <Link href={`/organisme/${org.slug}`} className="font-semibold underline underline-offset-2">
                  {org.name}
                </Link>
              </>
            )}
          </p>
        }
        tone="blanc"
      >
        <Breadcrumbs items={[{ href: "/blog", label: "Blog" }, { label: titre }]} />
      </PageHero>
      {t.org?.cover_url && (
        <div className="mx-auto max-w-3xl px-4 pt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.org.cover_url} alt="" className="brut w-full bg-white object-cover" loading="eager" />
        </div>
      )}
      <article className="prose-af mx-auto max-w-3xl px-4 py-10" dangerouslySetInnerHTML={{ __html: html }} />
      <aside className="mx-auto max-w-3xl px-4 pb-6">
        {org && (
          <p className="mb-6 rounded-2xl border-[3px] border-encre/20 bg-white p-4 text-sm text-encre/80">
            Article rédigé par{" "}
            <Link href={`/organisme/${org.slug}`} className="font-semibold underline underline-offset-2">
              {org.name}
            </Link>
            , organisme référencé dans l&apos;annuaire, et relu avant publication.
            {org.is_group ? " Cet organisme fait partie du groupe qui édite l'annuaire." : ""}
          </p>
        )}
        <div className="rounded-3xl border-4 border-encre bg-jaune p-6">
          <p className="font-display text-xl">Vous êtes organisme de formation ou formateur indépendant ?</p>
          <p className="mt-2">Publiez vos parcours et vos articles dans l&apos;annuaire, relus par une personne avant mise en ligne.</p>
          <Link href="/publier" className="tap mt-4 inline-block rounded-full border-4 border-encre bg-white px-5 py-2 font-semibold">
            Publier mes parcours
          </Link>
        </div>
        {autres.length > 0 && (
          <nav aria-label="À lire aussi" className="mt-10">
            <h2 className="font-display text-2xl">À lire aussi</h2>
            <ul className="mt-3 space-y-2">
              {autres.map((a) => (
                <li key={`${a.source}-${a.slug}`}>
                  <Link href={`/blog/${a.slug}`} className="tap underline underline-offset-4">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </aside>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [jsonld, ...faqJson(faq)] }} />
    </>
  );
}
