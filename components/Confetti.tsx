"use client";

import { useMemo } from "react";

/** Confettis sobres (24 pièces, 1,4 s). Rien n'est affiché si l'utilisateur réduit les animations. */
export function Confetti({ burstKey }: { burstKey: number }) {
  const pieces = useMemo(() => {
    const colors = ["#FFCD1C", "#2F5BFF", "#14206B", "#FF8FB1", "#16C79A"];
    // pseudo-aléatoire déterministe (pur) dérivé de l'index et du numéro de salve
    const r = (i: number, k: number) => {
      const x = Math.sin((burstKey + 1) * 97.13 + i * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: 24 }, (_, i) => ({
      i,
      left: 10 + r(i, 1) * 80,
      dx: (r(i, 2) - 0.5) * 220,
      rot: r(i, 3) * 720 - 360,
      delay: r(i, 4) * 120,
      color: colors[i % colors.length],
      w: 6 + r(i, 5) * 6,
    }));
  }, [burstKey]);
  if (!burstKey) return null;
  return (
    <div key={burstKey} aria-hidden="true" className="confetti pointer-events-none fixed inset-x-0 top-0 z-50 h-0 motion-reduce:hidden">
      {pieces.map((p) => (
        <span
          key={p.i}
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.w * 1.6,
              background: p.color,
              animationDelay: `${p.delay}ms`,
              "--dx": `${p.dx}px`,
              "--rot": `${p.rot}deg`,
            } as React.CSSProperties
          }
        />
      ))}
      <style>{`
        .confetti span { position: absolute; top: -20px; border: 1.5px solid #0D1240; border-radius: 2px;
          animation: confetti-fall 1400ms cubic-bezier(.2,.6,.4,1) forwards; }
        @keyframes confetti-fall { to { transform: translate(var(--dx), 70vh) rotate(var(--rot)); opacity: 0; } }
      `}</style>
    </div>
  );
}
