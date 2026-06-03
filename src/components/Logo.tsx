/* Brand logo mark — the lightning tile (matches the PWA icon). */
import React from "react";
import type { Palette } from "../lib/engine";

export function LogoMark({ P, size = 96, radius = 28, glow = true }: { P: Palette; size?: number; radius?: number; glow?: boolean }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, position: "relative",
      background: `linear-gradient(150deg, ${P.primary} 0%, ${P.primaryDeep} 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      boxShadow: glow ? `0 18px 48px ${P.primaryDeep}55, inset 0 1px 0 rgba(255,255,255,0.25)` : "inset 0 1px 0 rgba(255,255,255,0.25)",
    }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: radius, background: "linear-gradient(160deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 48%)" }} />
      {/* lightning bolt — same path as the app icon */}
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" style={{ position: "relative" }} aria-hidden="true">
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="#fff" />
      </svg>
    </div>
  );
}
