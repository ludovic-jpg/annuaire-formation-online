import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createProgram } from "@/app/espace/actions";

export default async function NouvelleFichePage() {
  const { supabase, user } = await requireUser("/espace/fiche/nouvelle");
  const { data: orgs } = await supabase.from("organizations").select("id, name").eq("owner_id", user.id).order("created_at");
  if (!orgs?.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="calm-card p-6">
          <h1 className="text-3xl">Renseignez d&apos;abord votre organisme</h1>
          <p className="mt-2">Une fiche est toujours rattachée à un organisme de formation.</p>
          <Link href="/espace/organisme" className="btn btn-nuit mt-5">Renseigner mon organisme</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <form action={createProgram} className="calm-card p-6 sm:p-8">
        <h1 className="text-3xl">Nouvelle fiche</h1>
        <p className="mt-2 text-encre/80">Donnez un titre à votre parcours. Vous compléterez le reste ensuite, avec un aperçu en direct.</p>
        {orgs.length > 1 ? (
          <div className="mt-5">
            <label htmlFor="org" className="label">Organisme</label>
            <select id="org" name="org_id" className="field">
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        ) : (
          <input type="hidden" name="org_id" value={orgs[0].id} />
        )}
        <div className="mt-5">
          <label htmlFor="title" className="label">Titre du parcours</label>
          <input id="title" name="title" required minLength={3} maxLength={200} className="field" placeholder="Ex. Anglais professionnel, niveau B1 vers B2" />
        </div>
        <button className="btn btn-nuit mt-6 w-full">Créer le brouillon</button>
      </form>
    </div>
  );
}
