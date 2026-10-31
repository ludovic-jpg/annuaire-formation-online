import { requireUser } from "@/lib/auth";
import { OrgForm } from "./OrgForm";
import type { Organization } from "@/lib/types";

export default async function OrganismeFormPage() {
  const { supabase, user } = await requireUser("/espace/organisme");
  const { data } = await supabase.from("organizations").select("*").eq("owner_id", user.id).order("created_at").limit(1).maybeSingle();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Mon organisme</h1>
      <p className="mt-2 text-encre/80">
        Ces informations apparaissent sur la page publique de votre organisme. Le SIRET et le numéro de déclaration d&apos;activité nous
        servent à vérifier que vous êtes bien un organisme de formation.
      </p>
      <OrgForm org={(data as Organization) ?? null} />
    </div>
  );
}
