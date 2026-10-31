"use client";

import { useActionState, useEffect, useRef } from "react";
import { joinWaitlist, type FormState } from "@/app/actions/public";
import { Mascotte } from "@/components/Mascotte";
import { FormField } from "@/components/FormField";

export function WaitlistForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(joinWaitlist, null);
  const formRef = useRef<HTMLFormElement>(null);
  const err = (f: string) => (state && !state.ok && state.field === f ? state.message : null);
  const v = state?.values ?? {};

  useEffect(() => {
    if (state && !state.ok && state.field) formRef.current?.querySelector<HTMLElement>(`[name="${state.field}"]`)?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <div role="status" className="calm-card anim-pop flex items-center gap-4 p-6">
        <Mascotte score={100} className="anim-wobble h-20 w-20 shrink-0" />
        <p className="text-lg font-semibold">{state.message}</p>
      </div>
    );
  }
  return (
    <form ref={formRef} action={action} className="calm-card grid gap-5 p-6 sm:p-8" noValidate>
      <div className="hidden" aria-hidden="true"><input name="site_web" tabIndex={-1} autoComplete="off" /></div>
      <FormField id="w-email" label="E-mail" error={err("email")}>
        {(a) => <input {...a} name="email" type="email" inputMode="email" required autoComplete="email" spellCheck={false} defaultValue={v.email} className="field" />}
      </FormField>
      <FormField id="w-org" label="Organisme" optional>
        {(a) => <input {...a} name="org_name" autoComplete="organization" defaultValue={v.org_name} className="field" />}
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="w-siret" label="SIRET" optional error={err("siret")} hint="14 chiffres.">
          {(a) => <input {...a} name="siret" inputMode="numeric" autoComplete="off" maxLength={20} defaultValue={v.siret} className="field" />}
        </FormField>
        <FormField id="w-web" label="Site" optional>
          {(a) => <input {...a} name="website" type="url" inputMode="url" autoComplete="url" defaultValue={v.website} className="field" placeholder="https://" />}
        </FormField>
      </div>
      <FormField id="w-msg" label="Message" optional>
        {(a) => <textarea {...a} name="message" rows={3} maxLength={2000} defaultValue={v.message} className="field" />}
      </FormField>
      {state && !state.ok && (
        <p role="alert" className={state.field ? "sr-only" : "field-error"}>{state.message}</p>
      )}
      <button className="btn btn-nuit" disabled={pending} aria-busy={pending}>{pending ? "Inscription en cours…" : "M'inscrire"}</button>
      <p className="hint">Vous pourrez vous désinscrire à tout moment en nous écrivant.</p>
    </form>
  );
}
