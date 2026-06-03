/* Opening animation — violet backdrop + brand logo, then hands off to the app. */
import React from "react";
import { motion } from "framer-motion";
import type { Palette } from "../lib/engine";

export function Splash({ P }: { P: Palette }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 26,
        background: `radial-gradient(120% 90% at 50% 30%, ${P.primary} 0%, ${P.primaryDeep} 60%, #3D2EB0 100%)`,
        overflow: "hidden",
      }}
    >
      {/* soft animated glow ring behind the mark */}
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.6, 1.9], opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.8, ease: "easeOut", times: [0, 0.5, 1] }}
        style={{
          position: "absolute", width: 220, height: 220, borderRadius: 9999,
          background: "radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)",
        }}
      />

      {/* logo tile — same lightning mark as the PWA icon */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 6 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.1 }}
        style={{
          width: 104, height: 104, borderRadius: 30, position: "relative",
          background: "linear-gradient(150deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 100%)",
          border: "1px solid rgba(255,255,255,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 24px 60px rgba(40,24,140,0.55), inset 0 1px 0 rgba(255,255,255,0.4)",
          backdropFilter: "blur(6px)",
        }}
      >
        <motion.svg
          width={52} height={52} viewBox="0 0 24 24" aria-hidden="true"
          initial={{ scale: 0.8, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.18 }}
        >
          <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="#fff" />
        </motion.svg>
      </motion.div>

      {/* wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.34 }}
        className="vp-display"
        style={{ color: "#fff", fontSize: 26, letterSpacing: "-0.02em", textShadow: "0 2px 18px rgba(40,24,140,0.5)" }}
      >
        Ventre plat
      </motion.div>
    </motion.div>
  );
}
