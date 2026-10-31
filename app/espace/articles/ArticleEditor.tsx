"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { enregistrerArticle, envoyerArticleEnRevue, rouvrirArticle, supprimerArticle } from "@/app/espace/articles/actions";
import {
  DESC_MAX,
  DESC_MIN,
  MOTS_MIN_REVUE,
  TITRE_MAX,
  compterMots,
  normaliserCorps,
  reecrireLiensSortants,
  slugArticle,
  type ArticleErreurs,
  type ArticleSaisie,
  type PostStatus,
} from "@/lib/articles";
import { renderMarkdownSur } from "@/lib/markdown";
import { MESSAGE_RECHARGE } from "@/lib/credits";
import { STATUTS_ARTICLE } from "@/lib/statuts";
import { FormField } from "@/components/FormField";
import { Confetti } from "@/components/Confetti";
import type { OrgPost } from "@/lib/types";

type OrgChoix = { id: string; name: string; is_group: boolean; peutEnvoyer: boolean };

const PISTE = [
  { key: "draft", label: "Brouillon" },
  { key: "pending", label: "En revue" },
  { key: "published", label: "Publié" },
];

function versSaisie(p: OrgPost | null): ArticleSaisie {
  return {
    title: p?.title ?? "",
    slug: p?.slug ?? "",
    description: p?.description ?? "",
    keyword: p?.keyword ?? "",
    body_md: p?.body_md ?? "",
    cover_url: p?.cover_url ?? "",
  };
}

export function ArticleEditor({ article, orgs, siteUrl }: { article: OrgPost | null; orgs: OrgChoix[]; siteUrl: string }) {
  const router = useRouter();
  const [saisie, setSaisie] = useState<ArticleSaisie>(() => versSaisie(article));
  const [orgId, setOrgId] = useState(article?.org_id ?? orgs[0]?.id ?? "");
  const [id, setId] = useState<string | null>(article?.id ?? null);
  const [status, setStatus] = useState<PostStatus>(article?.status ?? "draft");
  // Slug automatique tant qu'on ne l'a pas modifié à la main et que l'article n'a jamais été publié.
  const [slugManuel, setSlugManuel] = useState(Boolean(article?.slug && article.slug !== slugArticle(article.title)));
  const slugFige = Boolean(article?.published_at);
  const [onglet, setOnglet] = useState<"ecrire" | "apercu">("ecrire");
  const [erreurs, setErreurs] = useState<ArticleErreurs>({});
  const [message, setMessage] = useState<{ kind: "ok" | "erreur"; text: string } | null>(null);
  const [burst, setBurst] = useState(0);
  const [pending, startTransition] = useTransition();
  const dirty = useRef(false);

  const org = orgs.find((o) => o.id === orgId) ?? orgs[0];
  const editable = status !== "published";
  const peutEnvoyer = org?.peutEnvoyer ?? true;
  const mots = compterMots(saisie.body_md);
  const nbDesc = saisie.description.trim().length;
  const descOk = nbDesc >= DESC_MIN && nbDesc <= DESC_MAX;
  const st = STATUTS_ARTICLE[status];

  const apercu = useMemo(
    () => (onglet === "apercu" ? reecrireLiensSortants(renderMarkdownSur(normaliserCorps(saisie.body_md)), org?.is_group ? "sponsored" : "ugc", siteUrl) : ""),
    [onglet, saisie.body_md, org?.is_group, siteUrl],
  );

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty.current) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  function set<K extends keyof ArticleSaisie>(k: K, v: ArticleSaisie[K]) {
    dirty.current = true;
    setSaisie((s) => {
      const n = { ...s, [k]: v };
      if (k === "title" && !slugManuel && !slugFige) n.slug = slugArticle(String(v));
      return n;
    });
    if (erreurs[k]) setErreurs((e) => ({ ...e, [k]: undefined }));
  }

  function lancer(mode: "brouillon" | "revue") {
    setMessage(null);
    startTransition(async () => {
      const r = mode === "revue" ? await envoyerArticleEnRevue(id, orgId, saisie) : await enregistrerArticle(id, orgId, saisie);
      setErreurs(r.erreurs ?? {});
      if (!r.ok) {
        setMessage({ kind: "erreur", text: r.message ?? "L'enregistrement a échoué." });
        const premier = r.erreurs ? Object.keys(r.erreurs)[0] : null;
        if (premier) {
          if (premier === "body_md") setOnglet("ecrire");
          setTimeout(() => document.getElementById(`a-${premier}`)?.focus(), 0);
        }
        return;
      }
      dirty.current = false;
      if (r.status) setStatus(r.status);
      if (r.slug) setSaisie((s) => ({ ...s, slug: r.slug! }));
      setMessage({ kind: "ok", text: r.message ?? "Enregistré." });
      if (mode === "revue") setBurst((b) => b + 1);
      if (!id && r.id) {
        setId(r.id);
        router.replace(`/espace/articles/${r.id}`);
      }
    });
  }

  function rouvrir() {
    startTransition(async () => {
      const r = await rouvrirArticle(id!);
      if (r.ok) setStatus("draft");
      else setMessage({ kind: "erreur", text: r.message ?? "Impossible de rouvrir l'article." });
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Confetti burstKey={burst} />
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/espace/articles" className="tap text-sm font-semibold underline underline-offset-2">Mes articles</Link>
        <ol className="flex flex-wrap items-center gap-1 text-sm" aria-label="Statut de l'article">
          {PISTE.map((etape, i) => {
            const idx = PISTE.findIndex((x) => x.key === (status === "rejected" ? "draft" : status));
            const actuel = i === idx;
            const passe = i < idx;
            return (
              <li key={etape.key} className="flex items-center gap-1" aria-current={actuel ? "step" : undefined}>
                {i > 0 && <span aria-hidden="true" className={`h-0.5 w-4 ${passe || actuel ? "bg-encre" : "bg-encre/20"}`} />}
                <span
                  className={`rounded-full border-[3px] px-2.5 py-0.5 font-bold ${
                    actuel
                      ? status === "rejected"
                        ? "border-red-900 bg-red-100 text-red-900"
                        : `border-encre ${st.className}`
                      : passe
                        ? "border-encre bg-white"
                        : "border-encre/20 bg-white text-encre/60"
                  }`}
                >
                  {actuel && status === "rejected" ? "Refusé" : etape.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <h1 className="mt-3 text-3xl sm:text-4xl">{saisie.title || "Nouvel article"}</h1>
      <p className="mt-1 text-encre/75">{st.help}</p>
      {article?.reject_reason && (status === "rejected" || status === "draft") && (
        <p className="mt-3 rounded-xl bg-red-50 p-3 text-red-900">
          <strong>Motif du refus{status === "draft" ? " précédent" : ""} :</strong> {article.reject_reason}
        </p>
      )}
      {status === "published" && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-jaune-pale p-4">
          <p className="flex-1">
            Cet article est en ligne.{" "}
            <Link href={`/blog/${saisie.slug}`} className="font-semibold underline underline-offset-2">Le voir sur le blog</Link>. Pour le modifier,
            rouvrez-le : il sera retiré du blog jusqu&apos;à la nouvelle validation, sans nouveau débit.
          </p>
          <button type="button" onClick={rouvrir} disabled={pending} className="btn btn-blanc">Modifier cet article</button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-6">
          <fieldset disabled={!editable} className="calm-card grid gap-5 p-5 sm:p-6">
            <legend className="sr-only">Présentation de l&apos;article</legend>
            <h2 className="text-2xl">Présentation</h2>
            {orgs.length > 1 && !article && (
              <div>
                <label htmlFor="a-org" className="label">Organisme auteur</label>
                <select id="a-org" value={orgId} onChange={(e) => setOrgId(e.target.value)} className="field">
                  {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
            )}
            <FormField id="a-title" label="Titre" error={erreurs.title} hint={`Entre 10 et ${TITRE_MAX} caractères. C'est le titre affiché en haut de l'article.`}>
              {(a) => <input {...a} value={saisie.title} onChange={(e) => set("title", e.target.value)} maxLength={TITRE_MAX + 20} className="field" placeholder="Ex. Comment financer une formation en anglais avec le CPF" />}
            </FormField>
            <FormField
              id="a-slug"
              label="Adresse de l'article"
              error={erreurs.slug}
              hint={slugFige ? "L'adresse d'un article déjà publié ne change plus." : `annuaire-formation.online/blog/${saisie.slug || "…"}`}
            >
              {(a) => (
                <input
                  {...a}
                  value={saisie.slug}
                  readOnly={slugFige}
                  onChange={(e) => {
                    setSlugManuel(true);
                    set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  maxLength={80}
                  className="field font-mono text-sm"
                  spellCheck={false}
                  autoComplete="off"
                />
              )}
            </FormField>
            {!slugFige && slugManuel && (
              <button
                type="button"
                onClick={() => {
                  setSlugManuel(false);
                  set("slug", slugArticle(saisie.title));
                }}
                className="-mt-3 justify-self-start text-sm font-semibold text-vif underline underline-offset-2"
              >
                Recalculer l&apos;adresse depuis le titre
              </button>
            )}
            <FormField
              id="a-description"
              label={
                <>
                  Chapô (description pour les moteurs de recherche)
                  <span className={`float-right text-sm font-bold ${descOk ? "text-emerald-700" : nbDesc > DESC_MAX ? "text-brique" : "text-encre/60"}`}>
                    {nbDesc} / {DESC_MIN} à {DESC_MAX} caractères
                  </span>
                </>
              }
              error={erreurs.description}
              hint="Résumez l'article en une ou deux phrases. Il apparaît sous le titre dans Google et dans la liste du blog."
            >
              {(a) => <textarea {...a} value={saisie.description} onChange={(e) => set("description", e.target.value)} rows={3} className="field" />}
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="a-keyword" label="Mot-clé principal" error={erreurs.keyword} hint="L'expression que vos lecteurs tapent, par exemple « formation anglais CPF ».">
                {(a) => <input {...a} value={saisie.keyword} onChange={(e) => set("keyword", e.target.value)} maxLength={80} className="field" />}
              </FormField>
              <FormField id="a-cover_url" label="Image de couverture" optional error={erreurs.cover_url} hint="Adresse complète d'une image dont vous avez les droits.">
                {(a) => <input {...a} type="url" inputMode="url" value={saisie.cover_url} onChange={(e) => set("cover_url", e.target.value)} className="field" placeholder="https://…/image.jpg" />}
              </FormField>
            </div>
          </fieldset>

          <section className="calm-card p-5 sm:p-6" aria-labelledby="t-corps">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="t-corps" className="text-2xl">Article</h2>
              <span className={`text-sm font-bold ${mots >= MOTS_MIN_REVUE ? "text-emerald-700" : "text-encre/60"}`} aria-live="polite">
                {mots} mot{mots > 1 ? "s" : ""} / {MOTS_MIN_REVUE} au moins
              </span>
            </div>
            <div role="tablist" aria-label="Mode d'édition" className="mt-4 flex gap-2">
              {(["ecrire", "apercu"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  role="tab"
                  id={`tab-${o}`}
                  aria-selected={onglet === o}
                  aria-controls={`panneau-${o}`}
                  onClick={() => setOnglet(o)}
                  className="chip min-h-10"
                >
                  {o === "ecrire" ? "Écrire" : "Aperçu"}
                </button>
              ))}
            </div>
            <div id="panneau-ecrire" role="tabpanel" aria-labelledby="tab-ecrire" hidden={onglet !== "ecrire"} className="mt-4">
              <FormField
                id="a-body_md"
                label={<span className="sr-only">Texte de l&apos;article en Markdown</span>}
                error={erreurs.body_md}
                hint={
                  <>
                    Markdown : « ## » pour un intertitre, « ### » pour un sous-titre, « - » pour une liste, **gras**, [texte du lien](https://…). Une section
                    « ## Questions fréquentes » avec des questions en « ### » sera reprise par Google. Le HTML n&apos;est pas interprété.
                  </>
                }
              >
                {(a) => (
                  <textarea
                    {...a}
                    value={saisie.body_md}
                    onChange={(e) => set("body_md", e.target.value)}
                    rows={22}
                    disabled={!editable}
                    className="field font-mono text-[0.95rem] leading-relaxed"
                    placeholder={"## Pourquoi ce sujet compte\n\nVotre texte…"}
                  />
                )}
              </FormField>
            </div>
            <div id="panneau-apercu" role="tabpanel" aria-labelledby="tab-apercu" hidden={onglet !== "apercu"} className="mt-4">
              <div className="rounded-2xl border-[3px] border-encre/15 bg-white p-5">
                <p className="font-display text-3xl font-extrabold leading-tight">{saisie.title || "Titre de l'article"}</p>
                {saisie.body_md.trim() ? (
                  <div className="prose-af mt-4" dangerouslySetInnerHTML={{ __html: apercu }} />
                ) : (
                  <p className="mt-4 text-encre/60">Rien à afficher pour l&apos;instant : écrivez dans l&apos;onglet « Écrire ».</p>
                )}
              </div>
            </div>
          </section>

          {message && (
            <p role={message.kind === "erreur" ? "alert" : "status"} className={`rounded-xl p-4 ${message.kind === "erreur" ? "border-[3px] border-brique bg-red-50 font-semibold" : "bg-menthe/20"}`}>
              {message.text}
            </p>
          )}

          {editable && (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => lancer("brouillon")} disabled={pending} className="btn btn-blanc">
                {pending ? "Enregistrement…" : "Enregistrer le brouillon"}
              </button>
              {status !== "pending" && (
                <button
                  type="button"
                  onClick={() => lancer("revue")}
                  disabled={pending || !peutEnvoyer}
                  aria-describedby={!peutEnvoyer ? "a-credit-bloque" : undefined}
                  className="btn btn-nuit"
                >
                  Envoyer en revue
                </button>
              )}
              {id && (
                <form action={supprimerArticle} onSubmit={(e) => { if (!confirm("Supprimer définitivement cet article ?")) e.preventDefault(); }}>
                  <input type="hidden" name="id" value={id} />
                  <button className="min-h-11 px-2 text-sm font-semibold text-brique underline underline-offset-2">Supprimer</button>
                </form>
              )}
            </div>
          )}
          {!peutEnvoyer && editable && status !== "pending" && (
            <p id="a-credit-bloque" className="rounded-xl bg-red-50 p-3 text-sm text-red-900">
              <strong>Crédit insuffisant :</strong> 1 € est nécessaire pour envoyer un article en revue. {MESSAGE_RECHARGE}.
            </p>
          )}
          {org?.is_group && editable && <p className="text-sm text-encre/70">Publication incluse : votre organisme fait partie des marques du groupe.</p>}
          {status === "pending" && (
            <p role="status" className="rounded-xl bg-jaune-pale p-4">
              <strong>En revue.</strong> Nous relisons votre article, en général sous 2 jours ouvrés. Vous pouvez encore l&apos;améliorer et enregistrer vos changements.
            </p>
          )}
        </div>

        <aside className="grid content-start gap-6 lg:sticky lg:top-24 lg:self-start" aria-label="Conseils et aperçu de la carte">
          <section className="calm-card p-5" aria-labelledby="t-carte">
            <h2 id="t-carte" className="text-lg">Aperçu dans la liste du blog</h2>
            <div className="mt-3 rounded-3xl border-4 border-encre bg-white p-5 shadow-[6px_6px_0_0_var(--color-encre)]">
              <p className="text-xs text-encre/70">par {org?.name ?? "votre organisme"}</p>
              <p className="mt-1 font-display text-xl leading-tight">{saisie.title || "Titre de l'article"}</p>
              <p className="mt-2 line-clamp-4 text-sm text-encre/85">{saisie.description || "Votre chapô apparaîtra ici."}</p>
            </div>
          </section>
          <section className="calm-card p-5 text-sm" aria-labelledby="t-regles">
            <h2 id="t-regles" className="text-lg">Avant l&apos;envoi en revue</h2>
            <ul className="mt-2 grid gap-1.5">
              {[
                [saisie.title.trim().length >= 10, "Un titre de 10 caractères au moins"],
                [descOk, `Un chapô de ${DESC_MIN} à ${DESC_MAX} caractères`],
                [saisie.keyword.trim().length > 0, "Un mot-clé principal"],
                [mots >= MOTS_MIN_REVUE, `${MOTS_MIN_REVUE} mots au moins`],
              ].map(([ok, t]) => (
                <li key={String(t)} className="flex items-start gap-2">
                  <span aria-hidden="true" className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[3px] text-[11px] font-black ${ok ? "border-nuit bg-jaune" : "border-slate-300"}`}>
                    {ok ? "✓" : ""}
                  </span>
                  <span className={ok ? "" : "text-encre/75"}>
                    {t}
                    <span className="sr-only">{ok ? " : fait" : " : à faire"}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-encre/75">
              Un texte original et utile, sans copier votre site. Les liens vers d&apos;autres sites sont marqués comme contenu d&apos;utilisateur
              {org?.is_group ? " (ou sponsorisé pour les marques du groupe)" : ""}.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
