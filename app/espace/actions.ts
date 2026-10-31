"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { slugify, randomSuffix } from "@/lib/slug";
import { canSubmit, computeCompleteness } from "@/lib/completude";
import { SPHERES, MODALITES, CERTIFICATIONS } from "@/lib/spheres";

export type ActionResult = { ok: boolean; message?: string; errors?: string[]; savedAt?: string; completeness?: number };

const str = (v: FormDataEntryValue | null, max = 500) => {
  const s = String(v ?? "").trim().slice(0, max);
  return s.length ? s : null;
};
const url = (v: string | null) => (v && !/^https?:\/\//i.test(v) ? `https://${v}` : v);

export async function saveOrganization(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser("/espace/organisme");
  const id = str(fd.get("id"), 40);
  const name = str(fd.get("name"), 160);
  const siret = (str(fd.get("siret"), 30) ?? "").replace(/\s/g, "") || null;
  if (!name || name.length < 2) return { ok: false, message: "Indiquez le nom de l'organisme." };
  if (siret && !/^\d{14}$/.test(siret)) return { ok: false, message: "Le SIRET doit comporter 14 chiffres." };
  const payload = {
    name,
    siret,
    nda: str(fd.get("nda"), 20),
    qualiopi: fd.get("qualiopi") === "on",
    website: url(str(fd.get("website"), 300)),
    logo_url: url(str(fd.get("logo_url"), 500)),
    city: str(fd.get("city"), 80),
    region: str(fd.get("region"), 80),
    description: str(fd.get("description"), 2000),
  };
  if (id) {
    const { error } = await supabase.from("organizations").update(payload).eq("id", id);
    if (error) return { ok: false, message: "L'enregistrement a échoué : vérifiez l'adresse du site (elle doit commencer par https://)." };
  } else {
    let slug = slugify(name) || `organisme-${randomSuffix()}`;
    for (let i = 0; i < 4; i++) {
      const { error } = await supabase.from("organizations").insert({ ...payload, slug, owner_id: user.id });
      if (!error) break;
      if (error.code === "23505") {
        slug = `${slugify(name)}-${randomSuffix(4)}`;
        continue;
      }
      return { ok: false, message: "La création a échoué : vérifiez les champs et réessayez." };
    }
  }
  revalidatePath("/espace");
  return { ok: true, message: "Organisme enregistré.", savedAt: new Date().toISOString() };
}

export async function createProgram(fd: FormData) {
  const { supabase } = await requireUser("/espace/fiche/nouvelle");
  const org_id = String(fd.get("org_id") ?? "");
  const title = String(fd.get("title") ?? "").trim().slice(0, 200) || "Nouveau parcours";
  const { data, error } = await supabase
    .from("programs")
    .insert({ org_id, title, slug: `brouillon-${randomSuffix(8)}`, status: "draft", completeness: computeCompleteness({ title }).score })
    .select("id")
    .single();
  if (error || !data) redirect("/espace?erreur=creation");
  redirect(`/espace/fiche/${data.id}`);
}

export type ProgramDraft = {
  title: string;
  summary: string;
  objectives: string[];
  audience: string;
  prerequisites: string;
  duration_text: string;
  price_text: string;
  modality: string;
  sphere: string;
  city: string;
  certification: string;
  cpf_eligible: boolean;
  source_url: string;
  image_url: string;
};

function clean(d: ProgramDraft) {
  const t = (s: string, max: number) => (s ?? "").trim().slice(0, max) || null;
  return {
    title: t(d.title, 200) ?? "Nouveau parcours",
    summary: t(d.summary, 2000),
    objectives: (d.objectives ?? []).map((o) => o.trim().slice(0, 300)).filter(Boolean).slice(0, 12),
    audience: t(d.audience, 500),
    prerequisites: t(d.prerequisites, 500),
    duration_text: t(d.duration_text, 120),
    price_text: t(d.price_text, 120),
    modality: MODALITES.some((m) => m.value === d.modality) ? d.modality : null,
    sphere: SPHERES.some((s) => s.slug === d.sphere) ? d.sphere : null,
    city: t(d.city, 80),
    certification: (CERTIFICATIONS as readonly string[]).includes(d.certification) ? d.certification : null,
    cpf_eligible: Boolean(d.cpf_eligible),
    source_url: url(t(d.source_url, 500)),
    image_url: url(t(d.image_url, 500)),
  };
}

/** Autosave : ne change jamais le statut (sauf fiche refusée → brouillon). */
export async function saveProgram(id: string, draft: ProgramDraft): Promise<ActionResult> {
  const { supabase } = await requireUser(`/espace/fiche/${id}`);
  const { data: current } = await supabase.from("programs").select("status").eq("id", id).maybeSingle();
  if (!current) return { ok: false, message: "Fiche introuvable." };
  if (current.status === "published") return { ok: false, message: "Fiche publiée : cliquez sur « Modifier cette fiche » pour la rouvrir." };
  const data = clean(draft);
  const completeness = computeCompleteness(data).score;
  const status = current.status === "rejected" ? "draft" : current.status;
  const { error } = await supabase.from("programs").update({ ...data, completeness, status }).eq("id", id);
  if (error) return { ok: false, message: "Enregistrement impossible. Vérifiez l'adresse du site (https://…)." };
  return { ok: true, savedAt: new Date().toISOString(), completeness };
}

export async function submitProgram(id: string, draft: ProgramDraft): Promise<ActionResult> {
  const { supabase } = await requireUser(`/espace/fiche/${id}`);
  const data = clean(draft);
  const check = canSubmit(data);
  if (!check.ok) return { ok: false, errors: check.errors, message: "Il manque quelques éléments." };
  const { data: current } = await supabase.from("programs").select("slug, published_at, status").eq("id", id).maybeSingle();
  if (!current) return { ok: false, message: "Fiche introuvable." };
  const completeness = computeCompleteness(data).score;
  let slug = current.slug;
  if (!current.published_at) slug = slugify(data.title) || slug;
  for (let i = 0; i < 4; i++) {
    const { error } = await supabase.from("programs").update({ ...data, completeness, slug, status: "pending" }).eq("id", id);
    if (!error) {
      revalidatePath("/espace");
      return { ok: true, message: "Fiche envoyée en revue.", completeness };
    }
    if (error.code === "23505") {
      slug = `${slugify(data.title)}-${randomSuffix(4)}`;
      continue;
    }
    return { ok: false, message: "L'envoi a échoué. Réessayez dans un instant." };
  }
  return { ok: false, message: "L'envoi a échoué (adresse de fiche déjà prise)." };
}

export async function reopenProgram(id: string) {
  const { supabase } = await requireUser(`/espace/fiche/${id}`);
  const { data } = await supabase.from("programs").update({ status: "draft" }).eq("id", id).select("slug").maybeSingle();
  if (data?.slug) revalidatePath(`/formation/${data.slug}`);
  revalidatePath(`/espace/fiche/${id}`);
  revalidatePath("/espace");
}

export async function deleteProgram(fd: FormData) {
  const { supabase } = await requireUser("/espace");
  const id = String(fd.get("id") ?? "");
  await supabase.from("programs").delete().eq("id", id);
  revalidatePath("/espace");
  redirect("/espace");
}
