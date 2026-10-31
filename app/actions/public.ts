"use server";

import { publicClient } from "@/lib/supabase/public";

/** `field` : nom du champ en erreur (affichage inline) ; `values` : saisie renvoyée pour ne rien perdre après une erreur. */
export type FormState = { ok: boolean; message: string; field?: string; values?: Record<string, string> } | null;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function sendContactRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  if (String(fd.get("site_web") ?? "")) return { ok: true, message: "Message envoyé." }; // pot de miel
  const program_id = String(fd.get("program_id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const message = String(fd.get("message") ?? "").trim();
  const values = { name, email, message };
  if (name.length < 2) return { ok: false, field: "name", values, message: "Indiquez votre nom (2 caractères minimum)." };
  if (!EMAIL_RE.test(email)) return { ok: false, field: "email", values, message: "L'adresse e-mail n'est pas valide. Vérifiez qu'elle contient un @ et un domaine." };
  if (message.length < 5) return { ok: false, field: "message", values, message: "Votre message est trop court. Précisez votre besoin en une phrase." };
  const sb = publicClient();
  if (!sb) return { ok: false, values, message: "Le service est momentanément indisponible. Réessayez dans quelques minutes." };
  const { error } = await sb.from("contact_requests").insert({ program_id, name, email, message: message.slice(0, 2000) });
  if (error) return { ok: false, values, message: "L'envoi a échoué. Réessayez, ou écrivez à contact@annuaire-formation.online." };
  return { ok: true, message: "Message envoyé. L'organisme vous répondra directement par e-mail." };
}

export async function joinWaitlist(_prev: FormState, fd: FormData): Promise<FormState> {
  if (String(fd.get("site_web") ?? "")) return { ok: true, message: "Inscription enregistrée." };
  const email = String(fd.get("email") ?? "").trim();
  const org_name = String(fd.get("org_name") ?? "").trim() || null;
  const siretRaw = String(fd.get("siret") ?? "").replace(/\s/g, "");
  const website = String(fd.get("website") ?? "").trim() || null;
  const message = String(fd.get("message") ?? "").trim() || null;
  const values = { email, org_name: org_name ?? "", siret: String(fd.get("siret") ?? ""), website: website ?? "", message: message ?? "" };
  if (!EMAIL_RE.test(email)) return { ok: false, field: "email", values, message: "L'adresse e-mail n'est pas valide. Vérifiez qu'elle contient un @ et un domaine." };
  if (siretRaw && !/^\d{14}$/.test(siretRaw)) return { ok: false, field: "siret", values, message: "Le SIRET comporte 14 chiffres, sans lettres (espaces acceptés)." };
  const sb = publicClient();
  if (!sb) return { ok: false, values, message: "Le service est momentanément indisponible. Réessayez dans quelques minutes." };
  const { error } = await sb.from("waitlist").insert({ email, org_name, siret: siretRaw || null, website, message });
  if (error) return { ok: false, values, message: "L'inscription a échoué. Réessayez dans un instant." };
  return { ok: true, message: "C'est noté. Nous vous écrivons dès l'ouverture de votre accès." };
}
