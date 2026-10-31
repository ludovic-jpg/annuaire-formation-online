import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { Program } from "@/lib/types";
import { lireCredit } from "@/lib/credits-server";
import { peutEnvoyerEnRevue } from "@/lib/credits";
import { ProgramEditor } from "./ProgramEditor";

export default async function FichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser(`/espace/fiche/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("programs").select("*, organizations(name, slug, is_group)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Program & { organizations: { name: string; slug: string; is_group: boolean } };
  const credit = await lireCredit(supabase, { id: p.org_id, is_group: Boolean(p.organizations?.is_group) });
  return (
    <ProgramEditor
      program={p}
      orgName={p.organizations?.name ?? ""}
      credit={{ peutEnvoyer: peutEnvoyerEnRevue(credit), groupe: credit.groupe }}
    />
  );
}
