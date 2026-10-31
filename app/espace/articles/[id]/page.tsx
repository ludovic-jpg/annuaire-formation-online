import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { lireCredit } from "@/lib/credits-server";
import { peutEnvoyerEnRevue } from "@/lib/credits";
import { SITE_URL } from "@/lib/env";
import type { OrgPost } from "@/lib/types";
import { ArticleEditor } from "../ArticleEditor";

export const metadata = { title: "Modifier un article" };

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser(`/espace/articles/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data } = await supabase.from("posts").select("*, organizations(id, name, is_group)").eq("id", id).maybeSingle();
  if (!data) notFound();
  const p = data as OrgPost & { organizations: { id: string; name: string; is_group: boolean } | null };
  const org = p.organizations ?? { id: p.org_id, name: "", is_group: false };
  const credit = await lireCredit(supabase, org);
  const { organizations: _o, ...article } = p;
  void _o;
  return <ArticleEditor key={article.id} article={article} orgs={[{ ...org, peutEnvoyer: peutEnvoyerEnRevue(credit) }]} siteUrl={SITE_URL} />;
}
