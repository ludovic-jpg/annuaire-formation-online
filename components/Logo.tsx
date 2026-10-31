import Image from "next/image";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="3" y="5" width="40" height="38" rx="9" fill="#FFCD1C" stroke="#0D1240" strokeWidth="3" />
      <rect x="8" y="10" width="40" height="38" rx="9" fill="none" />
      <path d="M13 26.5l6.5 6.5L35 17" fill="none" stroke="#0D1240" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2">
      <Image
        src="/visuels/logo-annuaire-formation-pin.webp"
        alt=""
        width={512}
        height={512}
        priority
        className="h-9 w-9 shrink-0 sm:h-11 sm:w-11"
      />
      <span className="font-display text-[0.8rem] font-extrabold min-[400px]:text-[0.9rem] sm:text-[1.15rem] leading-none tracking-tight">
        Annuaire<span className="text-vif">.</span>Formation
        <span className="block text-[0.72rem] font-semibold tracking-normal text-nuit/70">online</span>
      </span>
    </span>
  );
}

/** Logo complet tel que fourni (pictogramme et texte), à utiliser dès qu'il peut s'afficher en grand. */
export function LogoComplet({ className = "h-36 w-36" }: { className?: string }) {
  return (
    <Image
      src="/visuels/logo-annuaire-formation.webp"
      alt="Annuaire Formation Online, l'annuaire des formations professionnelles"
      width={500}
      height={500}
      className={className}
    />
  );
}
