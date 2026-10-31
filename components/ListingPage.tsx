import Image from "next/image";
import Link from "next/link";
import type { ProgramWithOrg } from "@/lib/types";
import { ProgramCard } from "@/components/ProgramCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Mascotte } from "@/components/Mascotte";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/env";

export function ListingPage({
  title,
  intro,
  crumbs,
  programs,
  color,
  image,
  titreListe,
  children,
}: {
  title: string;
  intro: string;
  crumbs: { href?: string; label: string }[];
  programs: ProgramWithOrg[];
  color: string;
  image?: string;
  /** Titre H2 de la grille (hiérarchie : H1 > H2 > cartes en H3). */
  titreListe?: string;
  /** Contenu éditorial affiché après la liste (guide, liens, FAQ). */
  children?: React.ReactNode;
}) {
  const orgs = new Set(programs.map((p) => p.org_id)).size;
  return (
    <>
      <section className="dots border-b-4 border-encre">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <Breadcrumbs items={crumbs} />
          <div className="mt-6 grid items-center gap-6 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h1 className="text-4xl sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-lg">{intro}</p>
              <p className="mt-3 text-sm font-semibold">
                {programs.length} parcours, {orgs} organisme{orgs > 1 ? "s" : ""}.{" "}
                <Link href="/comment-fonctionne-le-classement" className="tap font-normal underline underline-offset-2">
                  Ordre d&apos;affichage
                </Link>
              </p>
            </div>
            {image && (
              <div className="brut relative hidden aspect-[4/3] overflow-hidden md:block" style={{ background: color }}>
                <Image src={image} alt="" fill sizes="35vw" className="object-cover" fetchPriority="high" />
              </div>
            )}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {programs.length > 0 && (
          <h2 className="mb-6 text-3xl">{titreListe ?? `Les ${programs.length} parcours publiés`}</h2>
        )}
        {programs.length ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p, i) => (
              <li key={p.id}>
                <ProgramCard p={p} priority={i < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="calm-card flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
            <Mascotte score={10} className="h-20 w-20 shrink-0" />
            <div>
              <p className="font-display text-xl font-extrabold">Aucun parcours publié ici pour l&apos;instant.</p>
              <p className="mt-1">
                Vous proposez une formation sur ce sujet&nbsp;?{" "}
                <Link href="/publier" className="font-semibold underline underline-offset-4">Publiez-la</Link>.
              </p>
            </div>
          </div>
        )}
        {children && <div className="mt-16 grid gap-14">{children}</div>}
      </div>
      {programs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: title,
            itemListElement: programs.slice(0, 50).map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/formation/${p.slug}`,
              name: p.title,
            })),
          }}
        />
      )}
    </>
  );
}
