"use client";

import { useActionState } from "react";
import { sendContactRequest, type FormState } from "@/app/actions/public";

export function ContactForm({ programId, orgName }: { programId: string; orgName: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContactRequest, null);
  if (state?.ok) {
    return (
      <p role="status" className="rounded-xl bg-menthe/20 p-4 font-semibold">
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="grid gap-3" noValidate>
      <input type="hidden" name="program_id" value={programId} />
      <div className="hidden" aria-hidden="true">
        <label>
          Site web <input name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label htmlFor="c-name" className="label">Nom</label>
        <input id="c-name" name="name" required autoComplete="name" className="field" />
      </div>
      <div>
        <label htmlFor="c-email" className="label">E-mail</label>
        <input id="c-email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <label htmlFor="c-msg" className="label">Message</label>
        <textarea id="c-msg" name="message" required rows={4} className="field" placeholder="Votre besoin, vos dates, votre financement…" />
      </div>
      {state && !state.ok && (
        <p role="alert" className="font-semibold text-brique">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-nuit" disabled={pending}>
        {pending ? "Envoi…" : `Écrire à ${orgName}`}
      </button>
      <p className="hint">
        Votre message est transmis à l&apos;organisme uniquement.{" "}
        <a href="/confidentialite" className="underline">Confidentialité</a>
      </p>
    </form>
  );
}
