import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { STATUTS } from "@/lib/statuts";
import { etapesOrganisme } from "@/lib/parcours-of";
import { ParcoursEtapes } from "@/components/ParcoursEtapes";
import { Mascotte } from "@/components/Mascotte";
import { CreditCard } from "@/components/CreditCard";
import { lireCredit } from "@/lib/credits-server";
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

  const etapes = etapesOrganisme({
    orgStatus: myOrgs[0]?.status ?? null,
    programs: programs.map((p) => ({ status: p.status, completeness: p.completeness })),
    contacts: contacts?.length ?? 0,
  });

  if (!myOrgs.length) {
    return (
      <div className="mx-auto grid max-w-4xl gap-6 px-4 py-12">
        <ParcoursEtapes etapes={etapes} />
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
  const credit = await lireCredit(supabase, org);
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

      <div className="mt-6">
        <ParcoursEtapes etapes={etapes} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <CreditCard credit={credit} />
        <section aria-labelledby="t-articles" className="calm-card flex flex-col justify-between gap-3 p-5 sm:p-6">
          <div>
            <h2 id="t-articles" className="text-2xl">Mes articles</h2>
            <p className="mt-1 text-sm text-encre/75">Publiez vos conseils sur le blog de l&apos;annuaire, signés par votre organisme et relus avant mise en ligne.</p>
          </div>
          <Link href="/espace/articles" className="btn btn-blanc self-start">Gérer mes articles</Link>
        </section>
      </div>

      <h2 className="mt-10 text-2xl">
        Fiches <span className="font-sans text-base font-semibold text-encre/70">({programs.length})</span>
      </h2>

      {programs.length ? (
        <ul className="mt-4 grid gap-3">
          {programs.map((p) => {
            const st = STATUTS[p.status];
            return (
              <li key={p.id} className="calm-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-encre/20 px-2.5 py-0.5 text-xs font-bold ${st.className}`}>
                      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${p.status === "published" ? "bg-menthe" : p.status === "pending" ? "bg-jaune" : p.status === "rejected" ? "bg-brique" : "bg-encre/40"}`} />
                      {st.label}
                    </span>
                    <span className="text-xs text-encre/60">Modifiée le {new Date(p.updated_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="mt-1 truncate font-display text-lg font-extrabold">{p.title}</p>
                  <p className={`text-sm ${p.status === "rejected" ? "font-semibold text-red-900" : "text-encre/75"}`}>
                    {p.status === "rejected" && p.reject_reason ? `Motif du refus : ${p.reject_reason}` : st.help}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-28" title={`Complétude ${p.completeness} %`}>
                    <div className="h-3 overflow-hidden rounded-full border-[1.5px] border-encre bg-white" role="progressbar" aria-valuenow={p.completeness} aria-valuemin={0} aria-valuemax={100} aria-label="Complétude">
                      <div className="h-full rounded-full bg-jaune" style={{ width: `${p.completeness}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-encre/70">{p.completeness} % complète</p>
                  </div>
                  {p.status === "published" && (
                    <Link href={`/formation/${p.slug}`} className="tap text-sm font-semibold underline underline-offset-2">
                      Voir<span className="sr-only"> la fiche publiée {p.title}</span>
                    </Link>
                  )}
                  <Link href={`/espace/fiche/${p.id}`} className="btn btn-blanc !min-h-11">
                    {p.status === "rejected" ? "Corriger" : p.status === "draft" ? "Compléter" : "Ouvrir"}
                    <span className="sr-only"> {p.title}</span>
                  </Link>
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
