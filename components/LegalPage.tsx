import { PageHero } from "@/components/PageHero";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <>
      <PageHero title={title} intro={<p className="text-base">Dernière mise à jour : {updated}</p>} tone="blanc">
        <Breadcrumbs items={[{ label: title }]} />
      </PageHero>
      <div className="prose-af mx-auto max-w-3xl px-4 py-10">{children}</div>
    </>
  );
}
