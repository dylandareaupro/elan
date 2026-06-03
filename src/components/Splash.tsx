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
          width={56} height={56} viewBox="0 0 100 100" aria-hidden="true"
          initial={{ scale: 0.8, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.18 }}
        >
          {/* orange spark (accent aigu of "Élan") */}
          <path d="M58.3855 26.8346C58.0645 26.6178 58.1014 26.1341 58.4515 25.9684L68.832 21.0548C69.2029 20.8793 69.6156 21.2005 69.5365 21.6032L67.4674 32.1319C67.3984 32.4832 66.9935 32.6502 66.6969 32.4498L58.3855 26.8346Z" fill="#FFB68A" />
          {/* white "e" */}
          <path d="M50.43 67.1C46.834 67.1 43.8167 66.5007 41.378 65.302C38.9393 64.062 37.1 62.1813 35.86 59.66C34.62 57.1387 34 53.9353 34 50.05C34 46.1233 34.62 42.92 35.86 40.44C37.1 37.9187 38.9187 36.0587 41.316 34.86C43.7547 33.62 46.7307 33 50.244 33C53.5507 33 56.3407 33.5993 58.614 34.798C60.8873 35.9553 62.6027 37.774 63.76 40.254C64.9173 42.6927 65.496 45.8547 65.496 49.74V51.972H42.742C42.8247 53.8733 43.114 55.4853 43.61 56.808C44.1473 58.1307 44.9533 59.1227 46.028 59.784C47.144 60.404 48.6113 60.714 50.43 60.714C51.422 60.714 52.3107 60.59 53.096 60.342C53.9227 60.094 54.6253 59.722 55.204 59.226C55.7827 58.73 56.2373 58.11 56.568 57.366C56.8987 56.622 57.064 55.7747 57.064 54.824H65.496C65.496 56.8907 65.124 58.6887 64.38 60.218C63.636 61.7473 62.6027 63.0287 61.28 64.062C59.9573 65.054 58.366 65.8187 56.506 66.356C54.6873 66.852 52.662 67.1 50.43 67.1ZM42.866 46.516H56.63C56.63 45.276 56.4647 44.2013 56.134 43.292C55.8447 42.3827 55.4313 41.6387 54.894 41.06C54.3567 40.4813 53.6953 40.068 52.91 39.82C52.166 39.5307 51.3187 39.386 50.368 39.386C48.7973 39.386 47.4747 39.6547 46.4 40.192C45.3667 40.688 44.5607 41.4733 43.982 42.548C43.4447 43.5813 43.0727 44.904 42.866 46.516Z" fill="#fff" />
        </motion.svg>
      </motion.div>

      {/* wordmark */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.34 }}
        className="vp-display"
        style={{ color: "#fff", fontSize: 34, letterSpacing: "-0.03em", textShadow: "0 2px 18px rgba(40,24,140,0.5)" }}
      >
        Élan
      </motion.div>
    </motion.div>
  );
}
