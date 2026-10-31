// Pictogrammes de thème : dessinés par le site (SVG), jamais incrustés dans les photos.
const PATHS: Record<string, React.ReactNode> = {
  "management-rh": (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.5-3.5 2.6-5 5.5-5s5 1.5 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16 14.2c2.6-.2 4.2 1.2 4.7 4.3" />
    </>
  ),
  "digital-bureautique": (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M9 20h6M12 16.5V20" />
    </>
  ),
  langues: (
    <>
      <path d="M4 5h16v11H11l-4.5 3.5V16H4z" />
      <path d="M8 9.5h8M8 12.5h5" />
    </>
  ),
  "bien-etre-massage": <path d="M12 20c-5-3.5-7.5-6.5-7.5-10A4 4 0 0 1 12 7.8 4 4 0 0 1 19.5 10c0 3.5-2.5 6.5-7.5 10z" />,
  "vente-commerce": (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </>
  ),
  "comptabilite-finance": (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M8.5 8h7M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
    </>
  ),
  "metiers-specifiques": <path d="M14.5 5.5a4 4 0 0 0-4.8 5.2L4 16.4 7.6 20l5.7-5.7a4 4 0 0 0 5.2-4.8l-2.6 2.6-2.8-.8-.8-2.8z" />,
  "rse-culture": (
    <>
      <path d="M12 20v-8" />
      <path d="M12 12c0-4 2.5-6 6.5-6 0 4-2.5 6-6.5 6zM12 15c0-3-2-4.5-5.5-4.5 0 3 2 4.5 5.5 4.5z" />
    </>
  ),
  "bilan-de-competences": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
};

export function SphereIcon({ sphere, color, size = 36 }: { sphere: string; color: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-grid shrink-0 place-items-center rounded-full border-[3px] border-encre"
      style={{ background: color, width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="none" stroke="#0D1240" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {PATHS[sphere] ?? PATHS["management-rh"]}
      </svg>
    </span>
  );
}
