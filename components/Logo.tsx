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
    <span className="inline-flex items-center gap-2">
      <LogoMark className="h-9 w-9 shrink-0" />
      <span className="font-display text-[1.15rem] font-extrabold leading-none tracking-tight">
        Annuaire<span className="text-vif">.</span>Formation
        <span className="block text-[0.72rem] font-semibold tracking-normal text-nuit/70">online</span>
      </span>
    </span>
  );
}
