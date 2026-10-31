import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Espace organisme", robots: { index: false, follow: false } };

export default async function EspaceLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await requireUser();
  return (
    <div className="min-h-[70vh] bg-slate-50">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
          <nav aria-label="Espace organisme" className="mr-auto flex flex-wrap gap-1">
            <Link href="/espace" className="rounded-lg px-3 py-2 font-semibold hover:bg-jaune-pale">Mes fiches</Link>
            <Link href="/espace/organisme" className="rounded-lg px-3 py-2 font-semibold hover:bg-jaune-pale">Mon organisme</Link>
            {isAdmin && <Link href="/admin" className="rounded-lg px-3 py-2 font-semibold text-vif hover:bg-jaune-pale">Administration</Link>}
          </nav>
          <span className="hidden text-sm text-encre/70 sm:inline">{user.email}</span>
          <form action="/auth/deconnexion" method="post">
            <button className="rounded-lg px-3 py-2 text-sm font-semibold underline underline-offset-2 hover:bg-slate-100">Se déconnecter</button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
