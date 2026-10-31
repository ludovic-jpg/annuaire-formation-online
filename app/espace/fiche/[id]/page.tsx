import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { Program } from "@/lib/types";
import { ProgramEditor } from "./ProgramEditor";

export default async function FichePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser(`/espace/fiche/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("programs").select("*, organizations(name, slug)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as Program & { organizations: { name: string; slug: string } };
  return <ProgramEditor program={p} orgName={p.organizations?.name ?? ""} />;
}
