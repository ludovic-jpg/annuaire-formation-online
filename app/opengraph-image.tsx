import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PIN = `data:image/png;base64,${readFileSync(join(process.cwd(), "public", "icon.png")).toString("base64")}`;

export const alt = "Annuaire Formation Online : le bon parcours de formation, sans détour";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFBEA", padding: 48 }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#FFCD1C",
            border: "6px solid #0D1240",
            borderRadius: 36,
            boxShadow: "14px 14px 0 #0D1240",
            padding: 56,
            color: "#0D1240",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 800 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={PIN} width={96} height={96} alt="" style={{ borderRadius: 16 }} />
            annuaire-formation.online
          </div>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, letterSpacing: -2, maxWidth: 900 }}>Le bon parcours de formation, sans détour.</div>
          <div style={{ display: "flex", gap: 16, fontSize: 30, fontWeight: 700 }}>
            {["Durée", "Prix", "Modalité", "CPF"].map((t) => (
              <div key={t} style={{ background: "#fff", border: "4px solid #0D1240", borderRadius: 999, padding: "8px 22px" }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
