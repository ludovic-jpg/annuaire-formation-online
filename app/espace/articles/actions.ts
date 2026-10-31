"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { slugsFichiers } from "@/lib/blog";
import { validerArticle, type ArticleErreurs, type ArticleSaisie, type PostStatus } from "@/lib/articles";
import { estErreurCredit, messageErreurCredit, peutEnvoyerEnRevue } from "@/lib/credits";
import { lireCredit } from "@/lib/credits-server";

export type ArticleResult = {
  ok: boolean;
  id?: string;
  status?: PostStatus;
  slug?: string;
  message?: string;
  erreurs?: ArticleErreurs;
  savedAt?: string;
};

const UUID = /^[0-9a-f-]{36}$/i;
const tableAbsente = (code?: string) => code === "42P01" || code === "PGRST205" || code === "PGRST202";
const MESSAGE_BIENTOT = "Le blog des organismes ouvre très bientôt : l'enregistrement n'est pas encore possible.";

function rafraichir(slug?: string | null, orgSlug?: string | null) {
  revalidatePath("/espace/articles");
  revalidatePath("/espace");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
  if (orgSlug) revalidatePath(`/organisme/${orgSlug}`);
}

async function ecrire(id: string | null, orgId: string, saisie: ArticleSaisie, mode: "brouillon" | "revue"): Promise<ArticleResult> {
  const { supabase } = await requireUser(id ? `/espace/articles/${id}` : "/espace/articles/nouveau");
  if (id && !UUID.test(id)) return { ok: false, message: "Article introuvable." };

  type Actuel = { status: PostStatus; slug: string; published_at: string | null; org_id: string };
  let actuel: Actuel | null = null;
  if (id) {
    const { data, error } = await supabase.from("posts").select("status, slug, published_at, org_id").eq("id", id).maybeSingle();
    if (error && tableAbsente(error.code)) return { ok: false, message: MESSAGE_BIENTOT };
    if (!data) return { ok: false, message: "Article introuvable." };
    actuel = data as Actuel;
    if (actuel.status === "published") return { ok: false, message: "Article publié : cliquez sur « Modifier cet article » pour le rouvrir." };
  }
  const org = actuel?.org_id ?? orgId;
  if (!UUID.test(org)) return { ok: false, message: "Choisissez l'organisme auteur de l'article." };

  // Une adresse déjà publiée ne change plus (liens et référencement).
  const v = validerArticle(actuel?.published_at ? { ...saisie, slug: actuel.slug } : saisie, mode, slugsFichiers());
  if (!v.ok) {
    return { ok: false, erreurs: v.erreurs, message: mode === "revue" ? "Il reste quelques points à corriger avant l'envoi en revue." : "Vérifiez les champs signalés." };
  }

  if (mode === "revue") {
    const { data: o } = await supabase.from("organizations").select("id, is_group").eq("id", org).maybeSingle();
    if (o) {
      const credit = await lireCredit(supabase, o as { id: string; is_group: boolean });
      if (!peutEnvoyerEnRevue(credit)) return { ok: false, message: messageErreurCredit() };
    }
  }

  const status: PostStatus = mode === "revue" ? "pending" : actuel?.status === "pending" ? "pending" : "draft";
  const ligne = { ...v.data, status };
  const req = id
    ? supabase.from("posts").update(ligne).eq("id", id).select("id, slug, status").maybeSingle()
    : supabase.from("posts").insert({ ...ligne, org_id: org }).select("id, slug, status").single();
  const { data, error } = await req;
  if (error) {
    if (tableAbsente(error.code)) return { ok: false, message: MESSAGE_BIENTOT };
    if (error.code === "23505") return { ok: false, erreurs: { slug: "Cette adresse est déjà utilisée par un autre article. Modifiez-la." }, message: "Vérifiez les champs signalés." };
    if (estErreurCredit(error)) return { ok: false, message: messageErreurCredit() };
    if (error.code === "23514") return { ok: false, message: "Un champ ne respecte pas le format attendu (titre de 10 à 140 caractères, adresse en minuscules)." };
    return { ok: false, message: "L'enregistrement a échoué. Réessayez dans un instant." };
  }
  if (!data) return { ok: false, message: "Article introuvable." };
  rafraichir();
  return { ok: true, id: data.id, slug: data.slug, status: data.status as PostStatus, savedAt: new Date().toISOString(), message: mode === "revue" ? "Article envoyé en revue." : "Brouillon enregistré." };
}

export async function enregistrerArticle(id: string | null, orgId: string, saisie: ArticleSaisie): Promise<ArticleResult> {
  return ecrire(id, orgId, saisie, "brouillon");
}

export async function envoyerArticleEnRevue(id: string | null, orgId: string, saisie: ArticleSaisie): Promise<ArticleResult> {
  return ecrire(id, orgId, saisie, "revue");
}

/** Article publié : repasse en brouillon (retiré du blog jusqu'à la nouvelle validation, sans nouveau débit). */
export async function rouvrirArticle(id: string): Promise<ArticleResult> {
  const { supabase } = await requireUser(`/espace/articles/${id}`);
  if (!UUID.test(id)) return { ok: false, message: "Article introuvable." };
  const { data, error } = await supabase.from("posts").update({ status: "draft" }).eq("id", id).select("slug, organizations(slug)").maybeSingle();
  if (error || !data) return { ok: false, message: "Impossible de rouvrir l'article." };
  const orgSlug = (data as unknown as { organizations?: { slug: string } | null }).organizations?.slug;
  rafraichir(data.slug, orgSlug);
  revalidatePath(`/espace/articles/${id}`);
  return { ok: true, status: "draft" };
}

export async function supprimerArticle(fd: FormData) {
  const { supabase } = await requireUser("/espace/articles");
  const id = String(fd.get("id") ?? "");
  if (UUID.test(id)) await supabase.from("posts").delete().eq("id", id);
  rafraichir();
  redirect("/espace/articles");
}
