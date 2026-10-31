"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveOrganization, type ActionResult } from "@/app/espace/actions";
import type { Organization } from "@/lib/types";

export function OrgForm({ org }: { org: Organization | null }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveOrganization, null);
  const f = (k: keyof Organization) => (org?.[k] as string | null) ?? "";
  return (
    <form action={action} className="calm-card mt-6 grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      {org && <input type="hidden" name="id" value={org.id} />}
      <div className="sm:col-span-2">
        <label htmlFor="o-name" className="label">Nom de l&apos;organisme <span className="req" aria-hidden="true">*</span></label>
        <input id="o-name" name="name" required defaultValue={f("name")} className="field" autoComplete="organization" />
      </div>
      <div>
        <label htmlFor="o-siret" className="label">SIRET</label>
        <input id="o-siret" name="siret" inputMode="numeric" autoComplete="off" maxLength={20} defaultValue={f("siret")} className="field" aria-describedby="o-siret-aide" />
        <p id="o-siret-aide" className="hint mt-1">14 chiffres, espaces acceptés.</p>
      </div>
      <div>
        <label htmlFor="o-nda" className="label">Numéro de déclaration d&apos;activité</label>
        <input id="o-nda" name="nda" inputMode="numeric" autoComplete="off" maxLength={20} defaultValue={f("nda")} className="field" aria-describedby="o-nda-aide" />
        <p id="o-nda-aide" className="hint mt-1">11 chiffres, attribué par la DREETS.</p>
      </div>
      <label className="flex min-h-11 items-center gap-3 font-semibold sm:col-span-2">
        <input type="checkbox" name="qualiopi" defaultChecked={org?.qualiopi ?? false} className="check" />
        Organisme certifié Qualiopi
      </label>
      <div>
        <label htmlFor="o-web" className="label">Site internet</label>
        <input id="o-web" name="website" type="url" inputMode="url" autoComplete="url" defaultValue={f("website")} className="field" placeholder="https://" />
      </div>
      <div>
        <label htmlFor="o-logo" className="label">Adresse du logo (facultatif)</label>
        <input id="o-logo" name="logo_url" type="url" inputMode="url" autoComplete="off" defaultValue={f("logo_url")} className="field" placeholder="https://…/logo.png" />
      </div>
      <div>
        <label htmlFor="o-city" className="label">Ville</label>
        <input id="o-city" name="city" defaultValue={f("city")} className="field" autoComplete="address-level2" />
      </div>
      <div>
        <label htmlFor="o-region" className="label">Région</label>
        <input id="o-region" name="region" defaultValue={f("region")} className="field" autoComplete="address-level1" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="o-desc" className="label">Présentation</label>
        <textarea id="o-desc" name="description" rows={5} maxLength={2000} defaultValue={f("description")} className="field" placeholder="Votre spécialité, vos publics, votre approche, en quelques phrases." />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button className="btn btn-nuit" disabled={pending} aria-busy={pending}>{pending ? "Enregistrement…" : "Enregistrer l'organisme"}</button>
        {state && (
          <p role={state.ok ? "status" : "alert"} className={state.ok ? "font-semibold text-emerald-800" : "field-error !mt-0"}>
            {state.message}
          </p>
        )}
        {state?.ok && (
          <Link href="/espace" className="btn btn-jaune">
            Étape suivante&nbsp;: ma fiche
          </Link>
        )}
      </div>
      {org && (
        <p className="hint sm:col-span-2">
          Statut : {org.status === "active" ? "vérifié" : org.status === "pending" ? "en cours de vérification" : "refusé"}.
        </p>
      )}
    </form>
  );
}
