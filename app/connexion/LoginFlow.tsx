"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/redirect";
import { Mascotte } from "@/components/Mascotte";

const ERREURS: Record<string, string> = {
  otp_expired: "Ce lien a expiré ou a déjà servi. Demandez-en un nouveau ci-dessous.",
  lien: "Le lien n'a pas pu être validé. Il a peut-être été ouvert dans un autre navigateur : demandez un nouveau lien, ou utilisez le code à 6 chiffres.",
};

export function LoginFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("suite"));
  const erreur = params.get("erreur");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "sent">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(erreur ? ERREURS[erreur] ?? ERREURS.lien : null);
  const [cooldown, setCooldown] = useState(0);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Cette adresse e-mail n'est pas valide. Vérifiez qu'elle contient un @ et un domaine.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?suite=${encodeURIComponent(next)}`,
      },
    });
    setBusy(false);
    if (error) {
      setError(
        error.status === 429
          ? "Trop de demandes en peu de temps. Patientez une minute avant de redemander un lien."
          : "L'envoi du lien a échoué. Vérifiez l'adresse et réessayez.",
      );
      return;
    }
    setStep("sent");
    setCooldown(60);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) {
      setError("Le code comporte 6 chiffres.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code, type: "email" });
    setBusy(false);
    if (error) {
      setError("Ce code est incorrect ou a expiré. Demandez un nouveau lien.");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  if (step === "sent") {
    return (
      <section aria-live="polite" className="calm-card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Mascotte score={70} className="anim-wobble h-20 w-20 shrink-0" />
          <h2 className="text-3xl">Vérifiez votre boîte mail</h2>
        </div>
        <p className="mt-4 text-lg">
          Nous avons envoyé un lien de connexion à <strong className="break-all">{email}</strong>. Cliquez dessus depuis ce
          navigateur pour ouvrir votre espace.
        </p>
        <ul className="mt-4 space-y-2 rounded-xl bg-jaune-pale p-4 text-[0.95rem]">
          <li>Rien reçu après deux minutes&nbsp;? Regardez dans les courriers indésirables (spams) et l&apos;onglet Promotions.</li>
          <li>L&apos;expéditeur est Supabase Auth, pour le compte d&apos;Annuaire Formation Online.</li>
          <li>Le lien est valable une heure et ne sert qu&apos;une fois.</li>
        </ul>
        {error && <p role="alert" className="mt-4 font-semibold text-brique">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn btn-blanc" disabled={busy || cooldown > 0} onClick={() => send()}>
            {cooldown > 0 ? `Renvoyer le lien (${cooldown} s)` : "Renvoyer le lien"}
          </button>
          <button type="button" className="btn btn-blanc" onClick={() => { setStep("email"); setError(null); }}>
            Changer d&apos;adresse
          </button>
        </div>
        <details className="mt-6 border-t pt-4">
          <summary className="cursor-pointer font-semibold">J&apos;ai reçu un code à 6 chiffres</summary>
          <form onSubmit={verify} className="mt-3 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="otp" className="label">Code</label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="field !w-40 text-center font-mono text-xl tracking-[0.3em]"
              />
            </div>
            <button type="submit" className="btn btn-nuit" disabled={busy}>Valider le code</button>
          </form>
        </details>
      </section>
    );
  }

  return (
    <form onSubmit={send} className="calm-card p-6 sm:p-8" noValidate>
      <h2 className="text-2xl">Recevoir mon lien de connexion</h2>
      <div className="mt-5">
        <label htmlFor="email" className="label">Adresse e-mail professionnelle</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field"
          placeholder="vous@organisme.fr"
          aria-describedby={error ? "login-err" : undefined}
        />
      </div>
      {error && <p id="login-err" role="alert" className="mt-3 font-semibold text-brique">{error}</p>}
      <button type="submit" className="btn btn-nuit mt-5 w-full" disabled={busy}>
        {busy ? "Envoi…" : "Recevoir mon lien"}
      </button>
      <p className="hint mt-4">
        Première visite&nbsp;? Le compte est créé automatiquement. En continuant, vous acceptez les{" "}
        <a href="/cgu" className="underline">conditions d&apos;utilisation</a>.
      </p>
    </form>
  );
}
