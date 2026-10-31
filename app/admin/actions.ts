"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

function refreshPublic(slug?: string | null, sphere?: string | null) {
  revalidatePath("/");
  revalidatePath("/formations");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/formation/${slug}`);
  if (sphere) revalidatePath(`/theme/${sphere}`);
  revalidatePath("/admin");
}

export async function approveProgram(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  const { data } = await supabase.from("programs").update({ status: "published", reject_reason: null }).eq("id", id).select("slug, sphere").single();
  await supabase.from("moderation_log").insert({ program_id: id, action: "approve" });
  refreshPublic(data?.slug, data?.sphere);
}

export async function rejectProgram(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  const reason = String(fd.get("reason") ?? "").trim().slice(0, 1000);
  if (reason.length < 5) return; // motif obligatoire (P2B / DSA)
  const { data } = await supabase.from("programs").update({ status: "rejected", reject_reason: reason }).eq("id", id).select("slug, sphere").single();
  await supabase.from("moderation_log").insert({ program_id: id, action: "reject", reason });
  refreshPublic(data?.slug, data?.sphere);
}

export async function unpublishProgram(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  const reason = String(fd.get("reason") ?? "").trim().slice(0, 1000) || "Retrait par l'administrateur";
  const { data } = await supabase.from("programs").update({ status: "rejected", reject_reason: reason }).eq("id", id).select("slug, sphere").single();
  await supabase.from("moderation_log").insert({ program_id: id, action: "unpublish", reason });
  refreshPublic(data?.slug, data?.sphere);
}

export async function toggleIndexable(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  const value = fd.get("value") === "true";
  const { data } = await supabase.from("programs").update({ indexable: value }).eq("id", id).select("slug, sphere").single();
  await supabase.from("moderation_log").insert({ program_id: id, action: "note", reason: `indexable=${value}` });
  refreshPublic(data?.slug, data?.sphere);
}

export async function setOrgStatus(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  const status = fd.get("status") === "active" ? "active" : "rejected";
  const { data } = await supabase.from("organizations").update({ status }).eq("id", id).select("slug").single();
  await supabase.from("moderation_log").insert({ action: status === "active" ? "org_activate" : "org_reject", reason: `organisation ${id}` });
  if (data?.slug) revalidatePath(`/organisme/${data.slug}`);
  refreshPublic();
}

/* ---------------------------- Articles des organismes ---------------------------- */

function refreshArticle(slug?: string | null, orgSlug?: string | null) {
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/blog/${slug}`);
  if (orgSlug) revalidatePath(`/organisme/${orgSlug}`);
  revalidatePath("/admin");
}

type PostMaj = { slug: string; organizations: { slug: string } | null } | null;

export async function approvePost(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  // Le trigger débite 1 € (organismes hors groupe), une seule fois par article.
  const { data, error } = await supabase.from("posts").update({ status: "published", reject_reason: null }).eq("id", id).select("slug, organizations(slug)").single();
  if (error) console.error("approvePost", error.message);
  const d = data as unknown as PostMaj;
  refreshArticle(d?.slug, d?.organizations?.slug);
}

export async function rejectPost(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(fd.get("id"));
  const reason = String(fd.get("reason") ?? "").trim().slice(0, 1000);
  if (reason.length < 5) return; // motif obligatoire, visible par l'organisme
  const { data, error } = await supabase.from("posts").update({ status: "rejected", reject_reason: reason }).eq("id", id).select("slug, organizations(slug)").single();
  if (error) console.error("rejectPost", error.message);
  const d = data as unknown as PostMaj;
  refreshArticle(d?.slug, d?.organizations?.slug);
}

/** Enregistre une clé dans Supabase Vault (chiffrée). La valeur ne revient jamais au navigateur. */
export async function saveSecret(fd: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(fd.get("name") ?? "");
  if (name !== "gemini_api_key") return; // liste blanche des clés acceptées
  const value = String(fd.get("value") ?? "").trim();
  if (value.length < 20 || /\s/.test(value)) return;
  await supabase.rpc("admin_set_secret", { p_name: name, p_value: value });
  revalidatePath("/admin");
}
