/* ============================================================
   ImageSlot — drag-drop / click-to-upload photo slot.
   Replaces the prototype's <image-slot> web component.
   Photos persist in localStorage, keyed by slot id, and are shared
   across every screen that renders the same id.
   ============================================================ */
import React from "react";
import { Icon } from "./Icon";

const STORE_KEY = "vp_imgslots";
type Store = Record<string, string>;

function readStore(): Store {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); } catch { return {}; }
}
function writeStore(s: Store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

export function setSlot(id: string, dataUrl: string | null) {
  const s = readStore();
  if (dataUrl) s[id] = dataUrl; else delete s[id];
  writeStore(s);
  notify();
}

/** Subscribe to a single slot id; returns its current data URL (or null). */
export function useSlot(id: string): string | null {
  const [, force] = React.useReducer((n) => n + 1, 0);
  React.useEffect(() => {
    listeners.add(force);
    return () => { listeners.delete(force); };
  }, []);
  return readStore()[id] || null;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function ImageSlot({
  id, shape = "rect", fit = "contain", placeholder = "", focus, style, className = "",
}: {
  id: string;
  shape?: "rect" | "circle";
  fit?: "cover" | "contain";
  placeholder?: string;
  focus?: "top" | "center";
  style?: React.CSSProperties;
  className?: string;
}) {
  const src = useSlot(id);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [over, setOver] = React.useState(false);

  async function take(file?: File | null) {
    if (!file || !file.type.startsWith("image/")) return;
    setSlot(id, await fileToDataUrl(file));
  }

  const radius = shape === "circle" ? "9999px" : 16;
  const objectPosition = focus === "top" ? "center 18%" : "center";

  return (
    <div
      className={`${className} ${src ? "vp-avatar-filled" : ""}`.trim()}
      data-filled={src ? "1" : undefined}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]); }}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        borderRadius: radius, overflow: "hidden", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: src ? "transparent" : (over ? "rgba(110,92,230,0.12)" : "transparent"),
        outline: over ? "2px dashed rgba(110,92,230,0.6)" : "none", outlineOffset: -2,
        ...style,
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => take(e.target.files?.[0])} />
      {src ? (
        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: fit, objectPosition }} />
      ) : placeholder ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "rgba(120,116,130,0.85)", textAlign: "center", padding: 8, pointerEvents: "none" }}>
          <Icon name="image" size={20} />
          <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.25 }}>{placeholder}</span>
        </div>
      ) : null}
    </div>
  );
}
