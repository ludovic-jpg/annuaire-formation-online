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
