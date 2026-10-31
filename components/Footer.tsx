import Link from "next/link";
import { SPHERES } from "@/lib/spheres";
import { Wordmark } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="on-dark mt-20 border-t-[3px] border-encre bg-nuit text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="inline-block rounded-2xl bg-white px-3 py-2 text-encre">
            <Wordmark />
          </div>
          <p className="mt-4 max-w-sm text-white/85">
            L&apos;annuaire des parcours de formation professionnelle. Édité par Back to Business (Formatrix), organisme de
            formation à Rixheim : nos propres offres y figurent et sont signalées comme telles.
          </p>
          <p className="mt-3">
            <Link href="/comment-fonctionne-le-classement" className="tap font-semibold text-jaune underline underline-offset-4">
              Comment fonctionne le classement
            </Link>
          </p>
        </div>
        <nav aria-label="Thèmes">
          <h2 className="font-display text-lg">Thèmes</h2>
          <ul className="mt-3 space-y-0.5">
            {SPHERES.map((s) => (
              <li key={s.slug}>
                <Link href={`/theme/${s.slug}`} className="tap text-white/85 underline-offset-4 hover:text-jaune hover:underline">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informations">
          <h2 className="font-display text-lg">L&apos;annuaire</h2>
          <ul className="mt-3 space-y-0.5">
            {[
              ["/publier", "Publier mes parcours"],
              ["/a-propos", "À propos et méthodologie"],
              ["/connexion", "Espace organisme"],
              ["/liste-attente", "Liste d'attente"],
              ["/contact", "Contact et signalement"],
              ["/mentions-legales", "Mentions légales"],
              ["/cgu", "Conditions d'utilisation"],
              ["/confidentialite", "Confidentialité"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="tap text-white/85 underline-offset-4 hover:text-jaune hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-white/15 py-4 text-center text-sm text-white/70">
        © {new Date().getFullYear()} Back to Business SASU, nom commercial Formatrix
      </p>
    </footer>
  );
}
