import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { STATUTS_ARTICLE } from "@/lib/statuts";
import { orgsAvecCredit } from "@/lib/espace";
import { CreditCard } from "@/components/CreditCard";
import type { OrgPost } from "@/lib/types";

export const metadata = { title: "Mes articles" };

export default async function MesArticlesPage() {
  const { supabase, user } = await requireUser("/espace/articles");
  const orgs = await orgsAvecCredit(supabase, user.id);
  if (!orgs.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="calm-card p-6">
          <h1 className="text-3xl">Renseignez d&apos;abord votre organisme</h1>
          <p className="mt-2">Un article est toujours signé par un organisme de formation.</p>
          <Link href="/espace/organisme" className="btn btn-nuit mt-5">Renseigner mon organisme</Link>
        </div>
      </div>
    );
  }
  const { data, error } = await supabase
    .from("posts")
    .select("id, org_id, slug, title, status, reject_reason, word_count, updated_at, published_at")
    .in("org_id", orgs.map((o) => o.id))
    .order("updated_at", { ascending: false });
  const indisponible = Boolean(error);
  const posts = (data ?? []) as Pick<OrgPost, "id" | "org_id" | "slug" | "title" | "status" | "reject_reason" | "word_count" | "updated_at" | "published_at">[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Mes articles</h1>
          <p className="mt-1 max-w-prose text-encre/75">
            Partagez votre expertise sur le blog de l&apos;annuaire. Chaque article est relu avant publication et signé par votre organisme, avec un lien vers votre page.
          </p>
        </div>
        {!indisponible && <Link href="/espace/articles/nouveau" className="btn btn-jaune">Écrire un article</Link>}
      </div>

      <div className="mt-6">
        <CreditCard credit={orgs[0].credit} />
      </div>

      {indisponible ? (
        <p className="calm-card mt-8 p-6 text-encre/80">Le blog des organismes ouvre très bientôt. Vous pourrez écrire vos articles depuis cette page.</p>
      ) : posts.length ? (
        <ul className="mt-8 grid gap-3">
          {posts.map((p) => {
            const st = STATUTS_ARTICLE[p.status];
            return (
              <li key={p.id} className="calm-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-encre/20 px-2.5 py-0.5 text-xs font-bold ${st.className}`}>
                      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${p.status === "published" ? "bg-menthe" : p.status === "pending" ? "bg-jaune" : p.status === "rejected" ? "bg-brique" : "bg-encre/40"}`} />
                      {st.label}
                    </span>
                    <span className="text-xs text-encre/60">
                      {p.word_count} mot{p.word_count > 1 ? "s" : ""} · modifié le {new Date(p.updated_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-display text-lg font-extrabold">{p.title}</p>
                  <p className={`text-sm ${p.status === "rejected" ? "font-semibold text-red-900" : "text-encre/75"}`}>
                    {p.status === "rejected" && p.reject_reason ? `Motif du refus : ${p.reject_reason}` : st.help}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {p.status === "published" && (
                    <Link href={`/blog/${p.slug}`} className="tap text-sm font-semibold underline underline-offset-2">
                      Voir<span className="sr-only"> l&apos;article publié {p.title}</span>
                    </Link>
                  )}
                  <Link href={`/espace/articles/${p.id}`} className="btn btn-blanc !min-h-11">
                    {p.status === "rejected" ? "Corriger" : p.status === "draft" ? "Continuer" : "Ouvrir"}
                    <span className="sr-only"> {p.title}</span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="calm-card mt-8 p-8 text-center sm:text-left">
          <p className="font-display text-2xl font-extrabold">Votre premier article vous attend.</p>
          <p className="mt-1 text-encre/80">Un conseil pratique, une question que vos stagiaires posent souvent, un retour d&apos;expérience : 300 mots suffisent.</p>
        </div>
      )}
    </div>
  );
}
