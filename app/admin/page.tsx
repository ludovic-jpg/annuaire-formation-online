import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { approveProgram, rejectProgram, setOrgStatus, toggleIndexable, unpublishProgram } from "./actions";
import { sphereLabel, modaliteLabel } from "@/lib/spheres";
import type { Organization, Program } from "@/lib/types";

type ProgramAdmin = Program & { organizations: Pick<Organization, "name" | "slug" | "status" | "is_group" | "siret" | "nda"> };

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const [pendingQ, orgsQ, waitQ, publishedQ, statsQ, contactsQ] = await Promise.all([
    supabase.from("programs").select("*, organizations(name, slug, status, is_group, siret, nda)").eq("status", "pending").order("updated_at"),
    supabase.from("organizations").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("waitlist").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("programs").select("id, title, slug, indexable, org_id, organizations(name, is_group)").eq("status", "published").order("title").limit(1000),
    supabase.from("programs").select("status"),
    supabase.from("contact_requests").select("id", { count: "exact", head: true }),
  ]);
  const pending = (pendingQ.data ?? []) as ProgramAdmin[];
  const orgs = (orgsQ.data ?? []) as Organization[];
  const waitlist = waitQ.data ?? [];
  const published = (publishedQ.data ?? []) as unknown as { id: string; title: string; slug: string; indexable: boolean; org_id: string; organizations: { name: string; is_group: boolean } }[];
  const counts: Record<string, number> = {};
  for (const r of statsQ.data ?? []) counts[r.status] = (counts[r.status] ?? 0) + 1;
  const indexed = published.filter((p) => p.indexable);
  const groupIndexed = indexed.filter((p) => p.organizations?.is_group).length;
  const groupShare = indexed.length ? Math.round((groupIndexed / indexed.length) * 100) : 0;
  const externalOrgs = orgs.filter((o) => o.status === "active" && !o.is_group).length;

  const stats: [string, string | number][] = [
    ["Publiées", counts.published ?? 0],
    ["En revue", counts.pending ?? 0],
    ["Brouillons", counts.draft ?? 0],
    ["Refusées", counts.rejected ?? 0],
    ["Organismes extérieurs actifs", externalOrgs],
    ["Part du groupe dans l'indexé", `${groupShare} %`],
    ["Demandes de contact", contactsQ.count ?? 0],
    ["Liste d'attente", waitlist.length],
  ];

  const ORG_STATUT: Record<string, [string, string]> = {
    active: ["Actif", "bg-menthe/25"],
    pending: ["À vérifier", "bg-jaune"],
    rejected: ["Refusé", "bg-red-100 text-red-900"],
  };
  const sommaire: [string, string, number | null][] = [
    ["#t-mod", "À relire", pending.length],
    ["#t-orgs", "Organisations", orgs.filter((o) => o.status === "pending").length],
    ["#t-pub", "Indexation", null],
    ["#t-wait", "Liste d'attente", waitlist.length],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Administration</h1>
        <Link href="/espace" className="font-semibold underline underline-offset-2">Retour à mon espace</Link>
      </div>

      <nav aria-label="Sections de l'administration" className="mt-5 flex flex-wrap gap-2">
        {sommaire.map(([href, label, n]) => (
          <a key={href} href={href} className="chip min-h-10 hover:bg-jaune-pale">
            {label}
            {n !== null && (
              <span className={`grid min-w-6 place-items-center rounded-full px-1.5 text-xs ${n > 0 ? "bg-jaune ring-2 ring-encre" : "bg-slate-100"}`}>{n}</span>
            )}
          </a>
        ))}
      </nav>

      <section aria-labelledby="t-stats" className="mt-6">
        <h2 id="t-stats" className="sr-only">Statistiques</h2>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(([k, v]) => (
            <div key={k} className="calm-card p-4">
              <dt className="text-sm text-encre/70">{k}</dt>
              <dd className={`font-display text-3xl font-extrabold ${k.startsWith("Part") && groupShare > 30 ? "text-brique" : ""}`}>{v}</dd>
            </div>
          ))}
        </dl>
        {groupShare > 30 && (
          <p className="mt-2 text-sm text-brique">Règle des 30 % dépassée : passez des fiches du groupe en non indexables (liste plus bas).</p>
        )}
      </section>

      <section aria-labelledby="t-mod" className="mt-10">
        <h2 id="t-mod" className="text-2xl">File de modération ({pending.length})</h2>
        {pending.length === 0 && <p className="mt-2 text-encre/70">Rien à relire.</p>}
        <ul className="mt-4 grid gap-4">
          {pending.map((p) => (
            <li key={p.id} className="calm-card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xl">{p.title}</h3>
                <span className="text-sm text-encre/70">Complétude {p.completeness} %</span>
              </div>
              <p className="text-sm text-encre/75">
                {p.organizations?.name} (organisme {p.organizations?.status === "active" ? "actif" : p.organizations?.status === "pending" ? "à vérifier" : "refusé"}
                {p.organizations?.siret ? `, SIRET ${p.organizations.siret}` : ", sans SIRET"}
                {p.organizations?.nda ? `, NDA ${p.organizations.nda}` : ""}) · {sphereLabel(p.sphere)} · {modaliteLabel(p.modality)}
                {p.city ? ` · ${p.city}` : ""}
              </p>
              <details className="mt-3">
                <summary className="cursor-pointer font-semibold">Lire la fiche</summary>
                <div className="mt-2 grid gap-2 text-sm">
                  <p><strong>Résumé :</strong> {p.summary}</p>
                  <p><strong>Objectifs :</strong> {p.objectives.join(" ; ")}</p>
                  <p><strong>Public :</strong> {p.audience} — <strong>Prérequis :</strong> {p.prerequisites}</p>
                  <p><strong>Durée :</strong> {p.duration_text} — <strong>Prix :</strong> {p.price_text} — <strong>CPF :</strong> {p.cpf_eligible ? "oui" : "non"} — <strong>Certification :</strong> {p.certification ?? "aucune"}</p>
                  {p.source_url && <p><strong>Source :</strong> <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="text-vif underline">{p.source_url}</a></p>}
                </div>
              </details>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <form action={approveProgram}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="btn btn-nuit">Approuver et publier</button>
                </form>
                <form action={rejectProgram} className="flex flex-1 flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <div className="min-w-56 flex-1">
                    <label htmlFor={`r-${p.id}`} className="label">Motif du refus (obligatoire, visible par l&apos;organisme)</label>
                    <input id={`r-${p.id}`} name="reason" required minLength={5} className="field" placeholder="Ex. Résumé copié de votre site : rédigez un texte original." />
                  </div>
                  <button className="btn btn-blanc">Refuser</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-orgs" className="mt-12">
        <h2 id="t-orgs" className="text-2xl">Organisations</h2>
        <div className="calm-card mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr><th className="p-3">Nom</th><th className="p-3">SIRET / NDA</th><th className="p-3">Statut</th><th className="p-3">Lien</th><th className="p-3">Actions</th></tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="p-3 font-semibold">{o.name}{o.is_group && <span className="ml-2 rounded bg-jaune-pale px-1.5 text-xs">groupe</span>}</td>
                  <td className="p-3">{o.siret ?? "—"} / {o.nda ?? "—"}</td>
                  <td className="p-3">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${ORG_STATUT[o.status]?.[1] ?? ""}`}>{ORG_STATUT[o.status]?.[0] ?? o.status}</span>
                  </td>
                  <td className="p-3">{o.link_rel}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {o.status !== "active" && (
                        <form action={setOrgStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="active" /><button className="min-h-9 rounded-lg border-[3px] border-nuit px-2.5 font-semibold">Activer<span className="sr-only"> {o.name}</span></button></form>
                      )}
                      {o.status !== "rejected" && (
                        <form action={setOrgStatus}><input type="hidden" name="id" value={o.id} /><input type="hidden" name="status" value="rejected" /><button className="min-h-9 rounded-lg border-[3px] border-slate-400 px-2.5">Refuser<span className="sr-only"> {o.name}</span></button></form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="t-pub" className="mt-12">
        <h2 id="t-pub" className="text-2xl">Fiches publiées et indexation</h2>
        <p className="mt-1 text-sm text-encre/70">{indexed.length} indexables sur {published.length}. Une fiche non indexable reste visible mais porte noindex.</p>
        <ul className="calm-card mt-4 divide-y">
          {published.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 p-3 text-sm">
              <Link href={`/formation/${p.slug}`} className="flex-1 font-semibold hover:underline">{p.title}</Link>
              <span className="text-encre/60">{p.organizations?.name}</span>
              <form action={toggleIndexable}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="value" value={String(!p.indexable)} />
                <button
                  aria-pressed={p.indexable}
                  title={p.indexable ? "Passer en noindex" : "Rendre indexable"}
                  className={`min-h-9 rounded-lg border-[3px] px-2.5 font-semibold ${p.indexable ? "border-emerald-700 bg-emerald-50 text-emerald-800" : "border-slate-400 text-encre/80"}`}
                >
                  {p.indexable ? "Indexable" : "Noindex"}
                  <span className="sr-only"> : {p.title}</span>
                </button>
              </form>
              <form action={unpublishProgram}>
                <input type="hidden" name="id" value={p.id} />
                <button className="min-h-9 rounded-lg border-[3px] border-slate-400 px-2.5">Retirer<span className="sr-only"> {p.title}</span></button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="t-wait" className="mt-12">
        <h2 id="t-wait" className="text-2xl">Liste d&apos;attente ({waitlist.length})</h2>
        <ul className="calm-card mt-4 divide-y">
          {waitlist.map((w) => (
            <li key={w.id} className="p-3 text-sm">
              <strong>{w.email}</strong> {w.org_name && `· ${w.org_name}`} {w.siret && `· ${w.siret}`} {w.website && `· ${w.website}`}
              <span className="ml-2 text-encre/60">{new Date(w.created_at).toLocaleDateString("fr-FR")}</span>
              {w.message && <p className="mt-1 text-encre/80">{w.message}</p>}
            </li>
          ))}
          {!waitlist.length && <li className="p-3 text-encre/70">Personne pour l&apos;instant.</li>}
        </ul>
      </section>
    </div>
  );
}
