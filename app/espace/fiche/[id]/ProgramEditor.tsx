"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveProgram, submitProgram, reopenProgram, deleteProgram, type ProgramDraft } from "@/app/espace/actions";
import { canSubmit, computeCompleteness, countWords, SUMMARY_MAX_WORDS, SUMMARY_MIN_WORDS } from "@/lib/completude";
import { SPHERES, MODALITES, CERTIFICATIONS, SPHERE_BY_SLUG, modaliteLabel } from "@/lib/spheres";
import { STATUTS } from "@/lib/statuts";
import { Mascotte } from "@/components/Mascotte";
import { Confetti } from "@/components/Confetti";
import type { Program } from "@/lib/types";

const CHAMP: Record<string, string> = {
  title: "e-title", sphere: "e-sphere", modality: "e-mod", duration: "e-dur", price: "e-price", place: "e-city",
  summary: "e-sum", objectives: "e-obj-0", audience: "e-aud", prerequisites: "e-pre", source: "e-src",
};
const SECTIONS = [
  { id: "sec-essentiel", label: "L'essentiel", keys: ["title", "sphere", "modality", "duration", "price", "place"] },
  { id: "sec-contenu", label: "Contenu", keys: ["summary", "objectives"] },
  { id: "sec-public", label: "Public", keys: ["audience", "prerequisites"] },
  { id: "sec-liens", label: "Liens", keys: ["source"] },
];
const PISTE = [
  { key: "draft", label: "Brouillon" },
  { key: "pending", label: "En revue" },
  { key: "published", label: "Publiée" },
];

function allerAuChamp(key: string) {
  const el = document.getElementById(CHAMP[key] ?? "");
  if (!el) return;
  el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  el.focus({ preventScroll: true });
}

type SaveState = { kind: "idle" | "saving" | "saved" | "error"; at?: string; message?: string };

function toDraft(p: Program): ProgramDraft {
  return {
    title: p.title ?? "",
    summary: p.summary ?? "",
    objectives: p.objectives?.length ? p.objectives : [""],
    audience: p.audience ?? "",
    prerequisites: p.prerequisites ?? "",
    duration_text: p.duration_text ?? "",
    price_text: p.price_text ?? "",
    modality: p.modality ?? "",
    sphere: p.sphere ?? "",
    city: p.city ?? "",
    certification: p.certification ?? "",
    cpf_eligible: p.cpf_eligible,
    source_url: p.source_url ?? "",
    image_url: p.image_url ?? "",
  };
}

export function ProgramEditor({ program, orgName }: { program: Program; orgName: string }) {
  const [draft, setDraft] = useState<ProgramDraft>(() => toDraft(program));
  const [status, setStatus] = useState(program.status);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [errors, setErrors] = useState<string[]>([]);
  const [burst, setBurst] = useState(0);
  const [pending, startTransition] = useTransition();
  const dirty = useRef(false);
  const locked = status === "published" || status === "pending";
  const editable = status !== "published";

  const { score, items } = useMemo(() => computeCompleteness(draft), [draft]);
  const words = countWords(draft.summary);
  const pret = useMemo(() => canSubmit(draft), [draft]);

  const set = <K extends keyof ProgramDraft>(k: K, v: ProgramDraft[K]) => {
    dirty.current = true;
    setDraft((d) => ({ ...d, [k]: v }));
  };

  const doSave = useCallback(async () => {
    if (!dirty.current || !editable) return;
    dirty.current = false;
    setSave({ kind: "saving" });
    const r = await saveProgram(program.id, draft);
    if (r.ok) {
      setSave({ kind: "saved", at: r.savedAt });
      if (status === "rejected") setStatus("draft");
    } else setSave({ kind: "error", message: r.message });
  }, [draft, editable, program.id, status]);

  // Enregistrement automatique 1,2 s après la dernière frappe
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(doSave, 1200);
    return () => clearTimeout(t);
  }, [draft, doSave]);

  // Avertit si on quitte avec des modifications non enregistrées
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  function submit() {
    setErrors([]);
    startTransition(async () => {
      const r = await submitProgram(program.id, draft);
      if (r.ok) {
        dirty.current = false;
        setStatus("pending");
        setSave({ kind: "saved", at: new Date().toISOString() });
        setBurst((b) => b + 1);
      } else {
        setErrors(r.errors ?? [r.message ?? "Envoi impossible."]);
      }
    });
  }

  function reopen() {
    startTransition(async () => {
      await reopenProgram(program.id);
      setStatus("draft");
    });
  }

  const st = STATUTS[status];
  const sphere = draft.sphere ? SPHERE_BY_SLUG[draft.sphere] : undefined;
  const fieldsDisabled = !editable;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Confetti burstKey={burst} />
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/espace" className="tap text-sm font-semibold underline underline-offset-2">Mes fiches</Link>
        <ol className="flex flex-wrap items-center gap-1 text-sm" aria-label="Statut de la fiche">
          {PISTE.map((etape, i) => {
            const idx = PISTE.findIndex((x) => x.key === (status === "rejected" ? "draft" : status));
            const actuel = i === idx;
            const passe = i < idx;
            return (
              <li key={etape.key} className="flex items-center gap-1" aria-current={actuel ? "step" : undefined}>
                {i > 0 && <span aria-hidden="true" className={`h-0.5 w-4 ${passe || actuel ? "bg-encre" : "bg-encre/20"}`} />}
                <span
                  className={`rounded-full border-2 px-2.5 py-0.5 font-bold ${
                    actuel
                      ? status === "rejected"
                        ? "border-red-900 bg-red-100 text-red-900"
                        : `border-encre ${st.className}`
                      : passe
                        ? "border-encre bg-white"
                        : "border-encre/20 bg-white text-encre/60"
                  }`}
                >
                  {actuel && status === "rejected" ? "Refusée" : etape.label}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-encre/70" aria-live="polite">
          {save.kind === "saving" && "Enregistrement…"}
          {save.kind === "saved" && `Enregistré à ${new Date(save.at!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
          {save.kind === "error" && <span className="font-semibold text-brique">{save.message}</span>}
        </p>
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl">{draft.title || "Nouveau parcours"}</h1>
      <p className="mt-1 text-encre/75">{st.help}</p>
      {status === "draft" && program.reject_reason && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-red-900"><strong>Motif du refus précédent :</strong> {program.reject_reason}</p>
      )}
      {status === "rejected" && program.reject_reason && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-red-900"><strong>Motif du refus :</strong> {program.reject_reason}</p>
      )}
      {status === "published" && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-jaune-pale p-4">
          <p className="flex-1">Cette fiche est en ligne. Pour la modifier, rouvrez-la : elle sera retirée de l&apos;annuaire jusqu&apos;à la nouvelle validation.</p>
          <button type="button" onClick={reopen} disabled={pending} className="btn btn-blanc">Modifier cette fiche</button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6">
          <nav aria-label="Sections de la fiche" className="sticky top-[4.6rem] z-20 -mx-1 overflow-x-auto rounded-2xl bg-slate-50/95 px-1 py-1.5 backdrop-blur">
            <ol className="flex gap-2">
              {SECTIONS.map((sec, i) => {
                const its = items.filter((it) => sec.keys.includes(it.key));
                const ok = its.every((it) => it.earned === it.points);
                return (
                  <li key={sec.id} className="shrink-0">
                    <a
                      href={`#${sec.id}`}
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full border-2 px-3 text-sm font-bold ${ok ? "border-encre bg-jaune" : "border-encre/25 bg-white hover:border-encre"}`}
                    >
                      <span aria-hidden="true" className="font-display">{ok ? "✓" : i + 1}</span>
                      {sec.label}
                      <span className="sr-only">{ok ? " : complète" : " : à compléter"}</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </nav>
          <fieldset id="sec-essentiel" disabled={fieldsDisabled} className="calm-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <legend className="sr-only">L&apos;essentiel</legend>
            <h2 className="text-2xl sm:col-span-2">L&apos;essentiel</h2>
            <div className="sm:col-span-2">
              <label htmlFor="e-title" className="label">Titre du parcours</label>
              <input id="e-title" value={draft.title} onChange={(e) => set("title", e.target.value)} maxLength={200} className="field" />
            </div>
            <div>
              <label htmlFor="e-sphere" className="label">Thème</label>
              <select id="e-sphere" value={draft.sphere} onChange={(e) => set("sphere", e.target.value)} className="field">
                <option value="">Choisir…</option>
                {SPHERES.map((s) => <option key={s.slug} value={s.slug}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <span className="label" id="e-mod-l">Modalité</span>
              <div role="radiogroup" aria-labelledby="e-mod-l" className="flex flex-wrap gap-2">
                {MODALITES.map((m) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={draft.modality === m.value}
                    key={m.value}
                    id={m.value === MODALITES[0].value ? "e-mod" : undefined}
                    onClick={() => set("modality", m.value)}
                    className={`min-h-11 rounded-xl border-2 px-3 font-semibold ${draft.modality === m.value ? "border-nuit bg-nuit text-white" : "border-slate-300 bg-white hover:border-nuit"}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="e-dur" className="label">Durée</label>
              <input id="e-dur" value={draft.duration_text} onChange={(e) => set("duration_text", e.target.value)} className="field" placeholder="35 heures sur 5 semaines" />
            </div>
            <div>
              <label htmlFor="e-price" className="label">Prix</label>
              <input id="e-price" value={draft.price_text} onChange={(e) => set("price_text", e.target.value)} className="field" placeholder="1 290 € HT ou sur devis" />
            </div>
            <div>
              <label htmlFor="e-city" className="label">Ville {draft.modality === "distanciel" && <span className="font-normal text-encre/60">(facultatif)</span>}</label>
              <input id="e-city" value={draft.city} onChange={(e) => set("city", e.target.value)} className="field" placeholder="Mulhouse" />
            </div>
            <div>
              <label htmlFor="e-cert" className="label">Certification</label>
              <select id="e-cert" value={draft.certification} onChange={(e) => set("certification", e.target.value)} className="field">
                <option value="">Aucune</option>
                {CERTIFICATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <label className="flex min-h-11 items-center gap-3 font-semibold sm:col-span-2">
              <input type="checkbox" checked={draft.cpf_eligible} onChange={(e) => set("cpf_eligible", e.target.checked)} className="check" />
              Parcours éligible au CPF
            </label>
          </fieldset>

          <fieldset id="sec-contenu" disabled={fieldsDisabled} className="calm-card grid gap-4 p-5 sm:p-6">
            <legend className="sr-only">Contenu</legend>
            <h2 className="text-2xl">Contenu</h2>
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor="e-sum" className="label">Résumé original</label>
                <span
                  className={`text-sm font-bold ${words >= SUMMARY_MIN_WORDS && words <= SUMMARY_MAX_WORDS ? "text-emerald-700" : words > SUMMARY_MAX_WORDS ? "text-brique" : "text-encre/60"}`}
                  aria-live="polite"
                >
                  {words} / {SUMMARY_MIN_WORDS}-{SUMMARY_MAX_WORDS} mots
                </span>
              </div>
              <textarea id="e-sum" value={draft.summary} onChange={(e) => set("summary", e.target.value)} rows={7} className="field" aria-describedby="e-sum-h" />
              <p id="e-sum-h" className="hint mt-1">
                Écrivez un texte propre à l&apos;annuaire plutôt qu&apos;un copier-coller de votre site : à qui il s&apos;adresse, ce qu&apos;on y fait, ce qu&apos;on sait faire à la fin.
              </p>
            </div>
            <div>
              <span className="label">Objectifs</span>
              <ul className="grid gap-2">
                {draft.objectives.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <label htmlFor={`e-obj-${i}`} className="sr-only">Objectif {i + 1}</label>
                    <input
                      id={`e-obj-${i}`}
                      value={o}
                      onChange={(e) => set("objectives", draft.objectives.map((x, j) => (j === i ? e.target.value : x)))}
                      className="field"
                      placeholder="Ex. Construire un tableau croisé dynamique"
                    />
                    <button
                      type="button"
                      aria-label={`Retirer l'objectif ${i + 1}`}
                      onClick={() => set("objectives", draft.objectives.length > 1 ? draft.objectives.filter((_, j) => j !== i) : [""])}
                      className="min-h-11 min-w-11 rounded-xl border-2 border-slate-300 font-bold hover:border-brique"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
              {draft.objectives.length < 12 && (
                <button type="button" onClick={() => set("objectives", [...draft.objectives, ""])} className="mt-2 min-h-11 font-semibold text-vif underline underline-offset-2">
                  Ajouter un objectif
                </button>
              )}
            </div>
          </fieldset>

          <fieldset id="sec-public" disabled={fieldsDisabled} className="calm-card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <legend className="sr-only">Public</legend>
            <h2 className="text-2xl sm:col-span-2">Public</h2>
            <div>
              <label htmlFor="e-aud" className="label">Public visé</label>
              <textarea id="e-aud" value={draft.audience} onChange={(e) => set("audience", e.target.value)} rows={3} className="field" />
            </div>
            <div>
              <label htmlFor="e-pre" className="label">Prérequis</label>
              <textarea id="e-pre" value={draft.prerequisites} onChange={(e) => set("prerequisites", e.target.value)} rows={3} className="field" placeholder="Aucun" />
            </div>
          </fieldset>

          <fieldset id="sec-liens" disabled={fieldsDisabled} className="calm-card grid gap-4 p-5 sm:p-6">
            <legend className="sr-only">Liens</legend>
            <h2 className="text-2xl">Liens</h2>
            <div>
              <label htmlFor="e-src" className="label">Page du parcours sur votre site</label>
              <input id="e-src" type="url" value={draft.source_url} onChange={(e) => set("source_url", e.target.value)} className="field" placeholder="https://votre-site.fr/formation/…" />
              <p className="hint mt-1">Le bouton « Voir le programme complet » de la fiche renverra vers cette page.</p>
            </div>
            <div>
              <label htmlFor="e-img" className="label">Image (facultatif)</label>
              <input id="e-img" type="url" value={draft.image_url} onChange={(e) => set("image_url", e.target.value)} className="field" placeholder="https://…/image.jpg" />
            </div>
          </fieldset>

          {errors.length > 0 && (
            <div role="alert" className="rounded-xl border-2 border-brique bg-red-50 p-4">
              <p className="font-bold">Avant l&apos;envoi en revue :</p>
              <ul className="mt-2 list-disc pl-5">
                {errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          {!locked && !pret.ok && errors.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-encre/30 bg-white p-4 text-sm">
              <p className="font-semibold">Pour envoyer en revue, il reste {pret.errors.length} point{pret.errors.length > 1 ? "s" : ""}&nbsp;:</p>
              <ul className="mt-1.5 list-disc pl-5 text-encre/80">
                {pret.errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {!locked && (
              <button type="button" onClick={submit} disabled={pending} className="btn btn-nuit">
                {pending ? "Envoi…" : "Envoyer en revue"}
              </button>
            )}
            {editable && (
              <Link href="/espace" onClick={() => doSave()} className="btn btn-blanc">Enregistrer et quitter</Link>
            )}
            {status !== "published" && (
              <form action={deleteProgram} onSubmit={(e) => { if (!confirm("Supprimer définitivement cette fiche ?")) e.preventDefault(); }}>
                <input type="hidden" name="id" value={program.id} />
                <button className="min-h-11 px-2 text-sm font-semibold text-brique underline underline-offset-2">Supprimer</button>
              </form>
            )}
          </div>
          {status === "pending" && (
            <p role="status" className="rounded-xl bg-jaune-pale p-4">
              <strong>Envoyée&nbsp;!</strong> Nous relisons votre fiche, en général sous 2 jours ouvrés. Vous la verrez passer en « Publiée » dans votre tableau de bord.
            </p>
          )}
        </div>

        <aside className="grid content-start gap-6 lg:sticky lg:top-24 lg:self-start" aria-label="Score et aperçu">
          <section className="calm-card p-5" aria-labelledby="t-score">
            <div className="flex items-center gap-4">
              <Mascotte score={score} className={`h-20 w-20 shrink-0 ${score === 100 ? "anim-wobble" : ""}`} />
              <div className="flex-1">
                <h2 id="t-score" className="text-lg">Complétude</h2>
                <p className="font-display text-4xl font-extrabold">{score}&nbsp;%</p>
                <div className="mt-1 h-3.5 overflow-hidden rounded-full border-[1.5px] border-encre bg-white" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label="Complétude de la fiche">
                  <div className="h-full rounded-full bg-jaune transition-[width] duration-500" style={{ width: `${score}%` }} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-encre/75">
              Les fiches complètes apparaissent en premier dans les résultats. Cliquez sur un critère pour aller au champ.
            </p>
            <ul className="mt-3 grid gap-1.5 text-sm">
              {items.map((it) => (
                <li key={it.key}>
                  <button
                    type="button"
                    onClick={() => allerAuChamp(it.key)}
                    disabled={!editable}
                    className="flex min-h-7 w-full items-start gap-2 rounded-lg px-1 py-0.5 text-left hover:bg-jaune-pale disabled:hover:bg-transparent"
                  >
                  <span aria-hidden="true" className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-black ${it.earned === it.points ? "border-nuit bg-jaune" : it.earned > 0 ? "border-nuit bg-jaune-pale" : "border-slate-300"}`}>
                    {it.earned === it.points ? "✓" : ""}
                  </span>
                  <span className={it.earned === it.points ? "" : "text-encre/75"}>
                    {it.label} <span className="text-encre/70">+{it.points}</span>
                    <span className="sr-only">{it.earned === it.points ? " : fait" : ` : ${it.hint}`}</span>
                    {it.earned !== it.points && <span aria-hidden="true" className="block text-xs text-encre/70">{it.hint}</span>}
                  </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="t-apercu">
            <h2 id="t-apercu" className="mb-2 text-lg">Aperçu</h2>
            <div className="brut overflow-hidden bg-white">
              <div className="h-3" style={{ background: sphere?.color ?? "#FFCD1C" }} />
              <div className="p-4">
                {sphere && <span className="text-xs font-bold text-encre/70">{sphere.label}</span>}
                <p className="font-display text-xl font-extrabold leading-tight">{draft.title || "Titre du parcours"}</p>
                <p className="mt-1 text-sm text-encre/70">{orgName}{draft.city ? `, ${draft.city}` : ""}</p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg bg-creme p-2"><dt className="text-encre/60">Durée</dt><dd className="font-bold">{draft.duration_text || "…"}</dd></div>
                  <div className="rounded-lg bg-creme p-2"><dt className="text-encre/60">Prix</dt><dd className="font-bold">{draft.price_text || "…"}</dd></div>
                  <div className="rounded-lg bg-creme p-2"><dt className="text-encre/60">Modalité</dt><dd className="font-bold">{draft.modality ? modaliteLabel(draft.modality) : "…"}</dd></div>
                </dl>
                {draft.summary && <p className="mt-3 line-clamp-5 text-sm">{draft.summary}</p>}
                <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-semibold">
                  {draft.cpf_eligible && <span className="rounded-md bg-menthe/25 px-2 py-1">Éligible CPF</span>}
                  {draft.certification && <span className="rounded-md bg-jaune px-2 py-1">Certifiant {draft.certification}</span>}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
