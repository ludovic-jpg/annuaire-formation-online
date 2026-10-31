/**
 * Mascotte « badge-diplôme » : une carte avec un visage et une coche jaune.
 * Son humeur suit le score de complétude (0-100).
 */
export function Mascotte({ score = 100, className = "", title }: { score?: number; className?: string; title?: string }) {
  const mood = score >= 85 ? "ravi" : score >= 50 ? "content" : score >= 20 ? "curieux" : "endormi";
  const mouth =
    mood === "ravi"
      ? "M44 70 Q60 86 76 70"
      : mood === "content"
        ? "M46 72 Q60 80 74 72"
        : mood === "curieux"
          ? "M50 74 Q60 74 70 74"
          : "M52 75 Q60 72 68 75";
  const eyes =
    mood === "endormi" ? (
      <>
        <path d="M40 54 h12" stroke="#0D1240" strokeWidth="4" strokeLinecap="round" />
        <path d="M68 54 h12" stroke="#0D1240" strokeWidth="4" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="46" cy="54" r={mood === "ravi" ? 5 : 4.5} fill="#0D1240" />
        <circle cx="74" cy="54" r={mood === "ravi" ? 5 : 4.5} fill="#0D1240" />
        <circle cx="47.5" cy="52.5" r="1.4" fill="#fff" />
        <circle cx="75.5" cy="52.5" r="1.4" fill="#fff" />
      </>
    );
  const checkLen = Math.max(0, Math.min(1, score / 100));
  return (
    <svg viewBox="0 0 140 150" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {/* ruban */}
      <path d="M44 112 L36 146 L50 138 L58 148 L64 114 Z" fill="#2F5BFF" stroke="#0D1240" strokeWidth="3" strokeLinejoin="round" />
      <path d="M96 112 L104 146 L90 138 L82 148 L76 114 Z" fill="#2F5BFF" stroke="#0D1240" strokeWidth="3" strokeLinejoin="round" />
      {/* ombre */}
      <rect x="17" y="13" width="108" height="104" rx="22" fill="#0D1240" />
      {/* carte */}
      <rect x="11" y="7" width="108" height="104" rx="22" fill="#FFFBEA" stroke="#0D1240" strokeWidth="3" />
      {/* joues */}
      <circle cx="36" cy="66" r="6" fill="#FF8FB1" opacity={mood === "endormi" ? 0.3 : 0.8} />
      <circle cx="84" cy="66" r="6" fill="#FF8FB1" opacity={mood === "endormi" ? 0.3 : 0.8} />
      {eyes}
      <path d={mouth} fill="none" stroke="#0D1240" strokeWidth="4" strokeLinecap="round" />
      {/* médaille coche */}
      <circle cx="104" cy="24" r="20" fill="#FFCD1C" stroke="#0D1240" strokeWidth="3" />
      <path
        d="M94 24 L101 31 L115 17"
        fill="none"
        stroke="#0D1240"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        strokeDashoffset={1 - checkLen}
        style={{ transition: "stroke-dashoffset 500ms ease" }}
      />
      {mood === "endormi" && (
        <text x="22" y="34" fontFamily="var(--font-display)" fontWeight="800" fontSize="16" fill="#14206B">
          z
        </text>
      )}
    </svg>
  );
}
