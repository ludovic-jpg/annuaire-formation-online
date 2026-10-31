import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../blog.css";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/env";
import { EDITEUR_ID, SITE_ID } from "@/lib/jsonld";
import { faqDepuisMarkdown, formaterDate, postVisible, postsVisibles, renderMarkdown, tempsDeLecture } from "@/lib/blog";

export const revalidate = 300;
export const dynamicParams = true;

export function generateStaticParams() {
  return postsVisibles().map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = postVisible(slug);
  if (!p) return { title: "Article introuvable", robots: { index: false } };
  const url = `/blog/${p.slug}`;
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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const p = postVisible(slug);
  if (!p) notFound();
  const html = renderMarkdown(p.body);
  const faq = faqDepuisMarkdown(p.body);
  const autres = postsVisibles().filter((x) => x.slug !== p.slug).slice(0, 3);
  const url = `${SITE_URL}/blog/${p.slug}`;

  return (
    <>
      <PageHero
        title={p.title}
        intro={
          <p className="text-base">
            <time dateTime={p.date}>{formaterDate(p.date)}</time> · {tempsDeLecture(p.body)} min de lecture
          </p>
        }
        tone="blanc"
      >
        <Breadcrumbs items={[{ href: "/blog", label: "Blog" }, { label: p.title }]} />
      </PageHero>
      <article className="prose-af mx-auto max-w-3xl px-4 py-10" dangerouslySetInnerHTML={{ __html: html }} />
      <aside className="mx-auto max-w-3xl px-4 pb-6">
        <div className="rounded-3xl border-[3px] border-encre bg-jaune p-6">
          <p className="font-display text-xl">Vous êtes organisme de formation ou formateur indépendant ?</p>
          <p className="mt-2">Publiez vos parcours gratuitement dans l&apos;annuaire, relus par une personne avant mise en ligne.</p>
          <Link href="/publier" className="tap mt-4 inline-block rounded-full border-[3px] border-encre bg-white px-5 py-2 font-semibold">
            Publier mes parcours
          </Link>
        </div>
        {autres.length > 0 && (
          <nav aria-label="À lire aussi" className="mt-10">
            <h2 className="font-display text-2xl">À lire aussi</h2>
            <ul className="mt-3 space-y-2">
              {autres.map((a) => (
                <li key={a.slug}>
                  <Link href={`/blog/${a.slug}`} className="tap underline underline-offset-4">
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </aside>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
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
              author: { "@type": "Person", name: "Ludovic Albisser" },
              publisher: { "@id": EDITEUR_ID },
              isPartOf: { "@id": SITE_ID },
            },
            ...(faq.length
              ? [
                  {
                    "@type": "FAQPage",
                    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
                  },
                ]
              : []),
          ],
        }}
      />
    </>
  );
}
