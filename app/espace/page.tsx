import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { STATUTS, STEPS } from "@/lib/statuts";
import { Mascotte } from "@/components/Mascotte";
import type { Organization, Program } from "@/lib/types";

export default async function EspacePage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { supabase, user } = await requireUser();
  const { erreur } = await searchParams;
  const { data: orgs } = await supabase.from("organizations").select("*").eq("owner_id", user.id).order("created_at");
  const myOrgs = (orgs ?? []) as Organization[];
  const orgIds = myOrgs.map((o) => o.id);
  const { data: progs } = orgIds.length
    ? await supabase.from("programs").select("*").in("org_id", orgIds).order("updated_at", { ascending: false })
    : { data: [] };
  const programs = (progs ?? []) as Program[];
  const { data: contacts } = orgIds.length
    ? await supabase.from("contact_requests").select("id, name, email, message, created_at, program_id").in("org_id", orgIds).order("created_at", { ascending: false }).limit(20)
    : { data: [] };

  if (!myOrgs.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="calm-card flex flex-col items-center gap-5 p-8 text-center sm:flex-row sm:text-left">
          <Mascotte score={20} className="h-28 w-28 shrink-0" />
          <div>
            <h1 className="text-3xl">Bienvenue&nbsp;! Commençons par votre organisme.</h1>
            <p className="mt-2 text-encre/80">Nom, SIRET, numéro de déclaration d&apos;activité : deux minutes, et vous pourrez créer votre première fiche.</p>
            <Link href="/espace/organisme" className="btn btn-nuit mt-5">Renseigner mon organisme</Link>
          </div>
        </div>
      </div>
    );
  }

  const org = myOrgs[0];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl">Mes fiches</h1>
          <p className="mt-1 text-encre/75">
            {org.name} :{" "}
            {org.status === "active" ? "organisme vérifié." : org.status === "pending" ? "organisme en cours de vérification." : "organisme refusé, contactez-nous."}
          </p>
        </div>
        <form action="/espace/fiche/nouvelle">
          <button className="btn btn-jaune">Créer une fiche</button>
        </form>
      </div>
      {erreur && <p role="alert" className="mt-4 font-semibold text-brique">La fiche n&apos;a pas pu être créée. Vérifiez que votre organisme est bien enregistré.</p>}

      <ol className="mt-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Étapes d'une fiche">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="h-0.5 w-6 bg-encre/30" />}
            <span className={`rounded-full px-3 py-1 font-semibold ${STATUTS[s].className}`}>{STATUTS[s].label}</span>
          </li>
        ))}
        <li className="text-encre/70">ou Refusée avec un motif</li>
      </ol>

      {programs.length ? (
        <ul className="mt-6 grid gap-3">
          {programs.map((p) => {
            const st = STATUTS[p.status];
            return (
              <li key={p.id} className="calm-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.className}`}>{st.label}</span>
                    <span className="text-xs text-encre/60">Modifiée le {new Date(p.updated_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="mt-1 truncate font-display text-lg font-extrabold">{p.title}</p>
                  <p className="text-sm text-encre/70">{p.status === "rejected" && p.reject_reason ? `Motif : ${p.reject_reason}` : st.help}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28" title={`Complétude ${p.completeness} %`}>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={p.completeness} aria-valuemin={0} aria-valuemax={100} aria-label="Complétude">
                      <div className="h-full rounded-full bg-jaune" style={{ width: `${p.completeness}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-encre/70">{p.completeness} % complète</p>
                  </div>
                  {p.status === "published" && (
                    <Link href={`/formation/${p.slug}`} className="text-sm font-semibold underline underline-offset-2">Voir</Link>
                  )}
                  <Link href={`/espace/fiche/${p.id}`} className="btn btn-blanc !min-h-10 !shadow-none">Ouvrir</Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="calm-card mt-6 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <Mascotte score={40} className="h-24 w-24 shrink-0" />
          <div>
            <p className="font-display text-2xl font-extrabold">Votre première fiche vous attend.</p>
            <p className="mt-1 text-encre/80">Un titre suffit pour commencer : tout est enregistré automatiquement au fil de la saisie.</p>
          </div>
        </div>
      )}

      <section className="mt-12" aria-labelledby="t-contacts">
        <h2 id="t-contacts" className="text-2xl">Demandes de contact reçues</h2>
        {contacts && contacts.length ? (
          <ul className="mt-4 grid gap-3">
            {contacts.map((c) => (
              <li key={c.id} className="calm-card p-4">
                <p className="font-semibold">
                  {c.name}, <a className="text-vif underline" href={`mailto:${c.email}`}>{c.email}</a>
                  <span className="ml-2 text-xs font-normal text-encre/60">{new Date(c.created_at).toLocaleString("fr-FR")}</span>
                </p>
                <p className="mt-1 whitespace-pre-line text-encre/85">{c.message}</p>
                <p className="mt-1 text-xs text-encre/60">Fiche : {programs.find((p) => p.id === c.program_id)?.title ?? "—"}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-encre/75">Aucune demande pour l&apos;instant. Elles apparaîtront ici dès qu&apos;un apprenant vous écrira depuis une fiche publiée.</p>
        )}
      </section>
    </div>
  );
}
