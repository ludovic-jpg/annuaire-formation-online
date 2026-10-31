import Link from "next/link";
import { SITE_URL } from "@/lib/env";
import { JsonLd } from "@/components/JsonLd";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const all = [{ href: "/", label: "Accueil" }, ...items];
  return (
    <>
      <nav aria-label="Fil d'Ariane" className="text-sm">
        <ol className="flex flex-wrap items-center gap-1.5 text-encre/70">
          {all.map((it, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">/</span>}
              {it.href && i < all.length - 1 ? (
                <Link href={it.href} className="tap hover:text-encre hover:underline">
                  {it.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-encre">
                  {it.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((it, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: it.label,
            ...(it.href ? { item: `${SITE_URL}${it.href}` } : {}),
          })),
        }}
      />
    </>
  );
}
