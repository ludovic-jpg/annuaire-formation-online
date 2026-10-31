import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { orgsAvecCredit } from "@/lib/espace";
import { SITE_URL } from "@/lib/env";
import { ArticleEditor } from "../ArticleEditor";

export const metadata = { title: "Nouvel article" };

export default async function NouvelArticlePage() {
  const { supabase, user } = await requireUser("/espace/articles/nouveau");
  const orgs = await orgsAvecCredit(supabase, user.id);
  if (!orgs.length) redirect("/espace/articles");
  return <ArticleEditor article={null} orgs={orgs.map((o) => ({ id: o.id, name: o.name, is_group: o.is_group, peutEnvoyer: o.peutEnvoyer }))} siteUrl={SITE_URL} />;
}
