"use server";

import { publicClient } from "@/lib/supabase/public";

export type FormState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function sendContactRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  if (String(fd.get("site_web") ?? "")) return { ok: true, message: "Message envoyé." }; // pot de miel
  const program_id = String(fd.get("program_id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const message = String(fd.get("message") ?? "").trim();
  if (name.length < 2) return { ok: false, message: "Indiquez votre nom (2 caractères minimum)." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "L'adresse e-mail n'est pas valide. Vérifiez qu'elle contient un @ et un domaine." };
  if (message.length < 5) return { ok: false, message: "Votre message est trop court. Précisez votre besoin en une phrase." };
  const sb = publicClient();
  if (!sb) return { ok: false, message: "Le service est momentanément indisponible. Réessayez dans quelques minutes." };
  const { error } = await sb.from("contact_requests").insert({ program_id, name, email, message: message.slice(0, 2000) });
  if (error) return { ok: false, message: "L'envoi a échoué. Réessayez, ou écrivez à contact@annuaire-formation.online." };
  return { ok: true, message: "Message envoyé. L'organisme vous répondra directement par e-mail." };
}

export async function joinWaitlist(_prev: FormState, fd: FormData): Promise<FormState> {
  if (String(fd.get("site_web") ?? "")) return { ok: true, message: "Inscription enregistrée." };
  const email = String(fd.get("email") ?? "").trim();
  const org_name = String(fd.get("org_name") ?? "").trim() || null;
  const siretRaw = String(fd.get("siret") ?? "").replace(/\s/g, "");
  const website = String(fd.get("website") ?? "").trim() || null;
  const message = String(fd.get("message") ?? "").trim() || null;
  if (!EMAIL_RE.test(email)) return { ok: false, message: "L'adresse e-mail n'est pas valide." };
  if (siretRaw && !/^\d{14}$/.test(siretRaw)) return { ok: false, message: "Le SIRET doit comporter 14 chiffres." };
  const sb = publicClient();
  if (!sb) return { ok: false, message: "Le service est momentanément indisponible." };
  const { error } = await sb.from("waitlist").insert({ email, org_name, siret: siretRaw || null, website, message });
  if (error) return { ok: false, message: "L'inscription a échoué. Réessayez dans un instant." };
  return { ok: true, message: "C'est noté. Nous vous écrivons dès l'ouverture de votre accès." };
}
