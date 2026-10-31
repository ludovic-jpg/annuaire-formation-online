import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { formaterDate, postsVisibles, tempsDeLecture } from "@/lib/blog";

export const revalidate = 300;

const TITLE = "Blog : guides pour organismes de formation et apprenants";
const DESCRIPTION =
  "Guides pratiques pour référencer une formation, rédiger un programme clair et comparer des parcours professionnels avant de s'inscrire.";

export function generateMetadata(): Metadata {
  // Tant qu'aucun article n'est visible, la page reste hors index (page vide = contenu faible).
  const vide = postsVisibles().length === 0;
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/blog" },
    openGraph: { title: TITLE, description: DESCRIPTION, url: "/blog" },
    ...(vide ? { robots: { index: false, follow: true } } : {}),
  };
}

export default function BlogPage() {
  const posts = postsVisibles();
  return (
    <>
      <PageHero
        title="Le blog de l'annuaire"
        intro={<p>Des guides concrets pour publier une formation lisible, et pour choisir la bonne quand on se forme.</p>}
      >
        <Breadcrumbs items={[{ label: "Blog" }]} />
      </PageHero>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="sr-only">Articles</h2>
        {posts.length === 0 ? (
          <p className="text-lg text-encre/80">Les premiers guides arrivent très bientôt.</p>
        ) : (
          <ul className="grid gap-6">
            {posts.map((p) => (
              <li key={p.slug} className="rounded-3xl border-[3px] border-encre bg-white p-6 shadow-[6px_6px_0_0_var(--color-encre)]">
                <p className="text-sm text-encre/70">
                  <time dateTime={p.date}>{formaterDate(p.date)}</time> · {tempsDeLecture(p.body)} min de lecture
                </p>
                <h3 className="mt-2 font-display text-2xl">
                  <Link href={`/blog/${p.slug}`} className="tap hover:underline underline-offset-4">
                    {p.title}
                  </Link>
                </h3>
                {p.description && <p className="mt-2 text-encre/85">{p.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
