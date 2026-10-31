"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendContactRequest, type FormState } from "@/app/actions/public";
import { FormField } from "@/components/FormField";

export function ContactForm({ programId, orgName }: { programId: string; orgName: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContactRequest, null);
  const formRef = useRef<HTMLFormElement>(null);
  const err = (f: string) => (state && !state.ok && state.field === f ? state.message : null);
  const v = state?.values ?? {};

  // Après une erreur, on place le focus sur le champ à corriger.
  useEffect(() => {
    if (state && !state.ok && state.field) formRef.current?.querySelector<HTMLElement>(`[name="${state.field}"]`)?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <div role="status" className="anim-pop flex items-start gap-3 rounded-xl border-2 border-encre bg-menthe/20 p-4">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0">
          <circle cx="12" cy="12" r="11" fill="#FFCD1C" stroke="#0D1240" strokeWidth="2" />
          <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#0D1240" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-semibold">{state.message}</p>
      </div>
    );
  }
  return (
    <form ref={formRef} action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="program_id" value={programId} />
      <div className="hidden" aria-hidden="true">
        <label>
          Site web <input name="site_web" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <FormField id="c-name" label="Nom" error={err("name")}>
        {(a) => <input {...a} name="name" required autoComplete="name" defaultValue={v.name} maxLength={120} className="field" />}
      </FormField>
      <FormField id="c-email" label="E-mail" error={err("email")} hint="L'organisme vous répondra à cette adresse.">
        {(a) => (
          <input {...a} name="email" type="email" inputMode="email" required autoComplete="email" spellCheck={false} defaultValue={v.email} className="field" />
        )}
      </FormField>
      <FormField id="c-msg" label="Message" error={err("message")}>
        {(a) => (
          <textarea
            {...a}
            name="message"
            required
            rows={4}
            maxLength={2000}
            defaultValue={v.message}
            className="field"
            placeholder="Votre besoin, vos dates, votre financement…"
          />
        )}
      </FormField>
      {state && !state.ok && !state.field && (
        <p role="alert" className="field-error">
          {state.message}
        </p>
      )}
      {state && !state.ok && state.field && (
        <p role="alert" className="sr-only">
          {state.message}
        </p>
      )}
      <button type="submit" className="btn btn-nuit" disabled={pending} aria-busy={pending}>
        {pending ? "Envoi en cours…" : `Écrire à ${orgName}`}
      </button>
      <p className="hint">
        Tous les champs sont obligatoires. Votre message est transmis à l&apos;organisme uniquement.{" "}
        <a href="/confidentialite" className="tap underline underline-offset-2">Confidentialité</a>
      </p>
    </form>
  );
}
