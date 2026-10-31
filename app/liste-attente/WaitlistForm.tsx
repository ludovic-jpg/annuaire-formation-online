"use client";

import { useActionState } from "react";
import { joinWaitlist, type FormState } from "@/app/actions/public";
import { Mascotte } from "@/components/Mascotte";

export function WaitlistForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(joinWaitlist, null);
  if (state?.ok) {
    return (
      <div role="status" className="calm-card flex items-center gap-4 p-6">
        <Mascotte score={100} className="anim-wobble h-20 w-20 shrink-0" />
        <p className="text-lg font-semibold">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="calm-card grid gap-4 p-6 sm:p-8" noValidate>
      <div className="hidden" aria-hidden="true"><input name="site_web" tabIndex={-1} autoComplete="off" /></div>
      <div>
        <label htmlFor="w-email" className="label">E-mail</label>
        <input id="w-email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <div>
        <label htmlFor="w-org" className="label">Organisme <span className="font-normal text-encre/60">(facultatif)</span></label>
        <input id="w-org" name="org_name" autoComplete="organization" className="field" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="w-siret" className="label">SIRET <span className="font-normal text-encre/60">(facultatif)</span></label>
          <input id="w-siret" name="siret" inputMode="numeric" className="field" />
        </div>
        <div>
          <label htmlFor="w-web" className="label">Site <span className="font-normal text-encre/60">(facultatif)</span></label>
          <input id="w-web" name="website" type="url" className="field" placeholder="https://" />
        </div>
      </div>
      <div>
        <label htmlFor="w-msg" className="label">Message <span className="font-normal text-encre/60">(facultatif)</span></label>
        <textarea id="w-msg" name="message" rows={3} className="field" />
      </div>
      {state && !state.ok && <p role="alert" className="font-semibold text-brique">{state.message}</p>}
      <button className="btn btn-nuit" disabled={pending}>{pending ? "Inscription…" : "M'inscrire"}</button>
      <p className="hint">Vous pourrez vous désinscrire à tout moment en nous écrivant.</p>
    </form>
  );
}
