/* ============================================================
   VENTRE PLAT — UI components (ref-matched). Consume palette `P`.
   Ported from ui.jsx.
   ============================================================ */
import React from "react";
import { Icon } from "./Icon";
import { ExerciseFigure } from "./ExerciseFigure";
import { ImageSlot } from "./ImageSlot";
import { dateKey, photoForName, figureForName, exSlug, type Exercise, type Palette, type Session } from "../lib/engine";

export const CARD_SHADOW = "0 1px 2px rgba(20,18,12,0.03), 0 10px 30px rgba(20,18,12,0.05)";
export const SOFT_SHADOW = "0 1px 2px rgba(20,18,12,0.04)";

/* Filename an exercise photo is looked up under. Drop a PNG named like this into
   public/assets/exercises/ and it shows up automatically — no code change needed.
   e.g. "Leg Raises" → "leg-raises.png", "World's Greatest" → "world-s-greatest.png". */
export function photoFile(name = "") {
  return exSlug(name).replace(/^vp-ex-/, "");
}

/* <img> that walks a list of candidate sources, falling back to the next one on
   load error (missing file / non-image), and finally to `fallback`. This is what
   makes "just drop a correctly-named image and it appears" work with zero wiring:
   a dropped per-slug file wins, else the curated keyword photo, else line-art. */
function ExercisePhoto({ srcs, alt, fit, fallback }: { srcs: string[]; alt: string; fit: "cover" | "contain"; fallback: React.ReactNode }) {
  const key = srcs.join("|");
  const [i, setI] = React.useState(0);
  React.useEffect(() => { setI(0); }, [key]);
  if (i >= srcs.length) return <>{fallback}</>;
  return <img key={srcs[i]} src={srcs[i]} alt={alt} onError={() => setI((n) => n + 1)}
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit, objectPosition: "center" }} />;
}

/* Unified exercise visual: dropped per-slug photo › curated keyword photo ›
   drag-drop slot (photo mode) › line-art */
export function ExerciseVisual({ ex, P, illustration, fit = "contain", slotShape = "rect", ghost, figPad = "8% 5%", placeholder = "" }: {
  ex: Exercise; P: Palette; illustration: string; fit?: "cover" | "contain"; slotShape?: "rect" | "circle"; ghost?: boolean; figPad?: string; placeholder?: string;
}) {
  const figId = figureForName(ex.name);
  const fallback = illustration === "photo" ? (
    <>
      {ghost && <div style={{ position: "absolute", inset: "10%", opacity: 0.14 }}><ExerciseFigure id={figId} color={P.figure} /></div>}
      <ImageSlot id={exSlug(ex.name)} shape={slotShape} fit={fit} placeholder={placeholder} />
    </>
  ) : (
    <div style={{ position: "absolute", inset: figPad }}><ExerciseFigure id={figId} color={P.figure} /></div>
  );
  const srcs = [`/assets/exercises/${photoFile(ex.name)}.png`, photoForName(ex.name)].filter(Boolean) as string[];
  return <ExercisePhoto srcs={srcs} alt={ex.name} fit={fit} fallback={fallback} />;
}

/* ---------- round icon button (white circle) ---------- */
export function RoundBtn({ icon, onClick, P, size = 46, dark, label, dot }: any) {
  return (
    <button onClick={onClick} aria-label={label} style={{
      width: size, height: size, borderRadius: 9999, flexShrink: 0, position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      background: dark ? P.ink : P.surface, color: dark ? P.bg : P.ink,
      boxShadow: CARD_SHADOW, border: `1px solid ${dark ? P.ink : P.border}`,
      transition: "transform .12s cubic-bezier(.22,.61,.36,1)",
    }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "")}>
      <Icon name={icon} size={20} />
      {dot && <span style={{ position: "absolute", top: 11, right: 12, width: 8, height: 8, borderRadius: 9999, background: P.coral, border: `1.5px solid ${P.surface}` }} />}
    </button>
  );
}

export function Eyebrow({ children, P, color, style }: any) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: color || P.muted, ...style }}>{children}</div>
  );
}

/* ---------- filled circular icon badge ---------- */
export function IconBadge({ icon, P, tone = "ink", size = 36 }: any) {
  const map: Record<string, { bg: string; fg: string }> = {
    ink: { bg: P.ink, fg: "#fff" }, action: { bg: P.action, fg: P.onAction },
    success: { bg: P.success, fg: P.onSuccess }, info: { bg: P.info, fg: P.onInfo },
    primary: { bg: P.primarySoft, fg: P.primaryDeep }, accent: { bg: P.accentSoft, fg: P.accentDeep },
    soft: { bg: P.tint, fg: P.ink },
    actionDeep: { bg: P.actionDeep, fg: "#fff" }, infoDeep: { bg: P.infoDeep, fg: "#fff" }, successDeep: { bg: P.successDeep, fg: "#fff" },
    primaryDeep: { bg: P.primaryDeep, fg: "#fff" }, accentDeep: { bg: P.accentDeep, fg: "#fff" },
  };
  const c = map[tone] || map.ink;
  return (
    <span style={{ width: size, height: size, borderRadius: 9999, background: c.bg, color: c.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name={icon} size={size * 0.5} />
    </span>
  );
}

/* ---------- pill / badge ---------- */
export function Pill({ children, P, tone = "surface", icon, style }: any) {
  const map: Record<string, { bg: string; fg: string; bd: string }> = {
    surface: { bg: P.surface, fg: P.ink, bd: P.border }, ink: { bg: P.ink, fg: "#fff", bd: P.ink },
    action: { bg: P.action, fg: P.onAction, bd: "transparent" }, success: { bg: P.success, fg: P.onSuccess, bd: "transparent" },
    info: { bg: P.info, fg: P.onInfo, bd: "transparent" }, ghost: { bg: "transparent", fg: P.text2, bd: P.borderStrong },
    primary: { bg: P.primarySoft, fg: P.primaryDeep, bd: "transparent" }, accent: { bg: P.accentSoft, fg: P.accentDeep, bd: "transparent" },
    soft: { bg: P.tint, fg: P.text2, bd: "transparent" },
  };
  const c = map[tone] || map.surface;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: icon ? "7px 13px 7px 9px" : "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 700, background: c.bg, color: c.fg, border: `1px solid ${c.bd}`, whiteSpace: "nowrap", ...style }}>
      {icon && <Icon name={icon} size={15} />}
      <span>{children}</span>
    </span>
  );
}

/* ---------- big primary CTA ---------- */
export function CTA({ children, onClick, P, ctaStyle = "peach", icon }: any) {
  const styles: Record<string, { bg: string; fg: string; sh: string }> = {
    peach: { bg: P.actionDeep, fg: "#fff", sh: `0 8px 22px ${P.actionDeep}55, 0 2px 6px ${P.actionDeep}33` },
    primary: { bg: P.primaryDeep, fg: "#fff", sh: `0 8px 22px ${P.primaryDeep}55, 0 2px 6px ${P.primaryDeep}33` },
    black: { bg: P.ink, fg: P.bg, sh: "0 8px 22px rgba(20,18,12,0.20), 0 2px 6px rgba(20,18,12,0.12)" },
  };
  const c = styles[ctaStyle] || styles.peach;
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "19px 24px", borderRadius: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      fontSize: 17.5, fontWeight: 700, letterSpacing: "-0.01em", background: c.bg, color: c.fg, boxShadow: c.sh,
      transition: "transform .12s cubic-bezier(.22,.61,.36,1)",
    }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "")}>
      {icon && <Icon name={icon} size={20} />}
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick, P, flex, icon }: any) {
  return (
    <button onClick={onClick} style={{
      flex: flex ? 1 : undefined, padding: "15px 20px", borderRadius: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      fontSize: 15, fontWeight: 700, color: P.text2, background: P.surface, border: `1px solid ${P.border}`, boxShadow: SOFT_SHADOW,
      transition: "transform .12s",
    }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "")}>
      {icon && <Icon name={icon} size={17} />}
      {children}
    </button>
  );
}

/* ---------- generic card ---------- */
export function Card({ children, P, tone = "surface", style, pad = 22, radius = 28 }: any) {
  const bg = ({ surface: P.surface, alt: P.surfaceAlt, tint: P.tint, action: P.actionSoft, success: P.successSoft, info: P.infoSoft, dark: P.darkCard } as Record<string, string>)[tone] || P.surface;
  const dark = tone === "dark";
  return (
    <div style={{ background: bg, borderRadius: radius, padding: pad, border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : P.border}`, boxShadow: CARD_SHADOW, ...style }}>{children}</div>
  );
}

/* ---------- pastel stat card (Time / Exercises style) ---------- */
export function StatCard({ label, value, unit, sub, icon, P, tone = "info" }: any) {
  const bg = ({ info: P.info, success: P.success, action: P.action, primary: P.primarySoft, accent: P.accentSoft, surface: P.surface } as Record<string, string>)[tone];
  const onColor = ({ info: P.onInfo, success: P.onSuccess, action: P.onAction, primary: P.primaryDeep, accent: P.accentDeep, surface: P.ink } as Record<string, string>)[tone];
  const badge = ({ info: "infoDeep", success: "successDeep", action: "actionDeep", primary: "primaryDeep", accent: "accentDeep", surface: "ink" } as Record<string, string>)[tone];
  return (
    <div style={{ background: bg, borderRadius: 26, padding: "18px 18px 20px", border: `1px solid ${tone === "surface" ? P.border : "transparent"}`, boxShadow: CARD_SHADOW, position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: onColor }}>{label}</div>
        {icon && <IconBadge icon={icon} P={P} tone={badge} size={30} />}
      </div>
      <div className="mono" style={{ fontSize: 38, fontWeight: 800, color: P.ink, marginTop: 14, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}{unit && <span style={{ fontSize: 19, fontWeight: 700, opacity: 0.5 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize: 13, fontWeight: 600, color: onColor, opacity: 0.6, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

/* ---------- week-day strip ---------- */
export function WeekStrip({ sessions, P }: { sessions: Session[]; P: Palette }) {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setDate(now.getDate() - day);
  const initials = ["L", "M", "M", "J", "V", "S", "D"];
  const days: { num: number; done: boolean; isToday: boolean; future: boolean }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const key = dateKey(d);
    days.push({ num: d.getDate(), done: sessions.some((s) => s.date.startsWith(key)), isToday: i === day, future: d > now });
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
      {days.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.muted }}>{initials[i]}</div>
          <div style={{
            width: 38, height: 38, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700,
            background: d.isToday ? P.actionDeep : d.done ? P.success : "transparent",
            color: d.isToday ? "#fff" : d.done ? P.onSuccess : d.future ? P.muted : P.text2,
            border: !d.isToday && !d.done ? `1.5px solid ${P.border}` : "none",
            position: "relative",
          }} className="mono">
            {d.num}
            {d.done && !d.isToday && <span style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: 9999, background: P.successDeep }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- donut ring (percent) ---------- */
export function DonutRing({ pct, P, size = 88, stroke = 11, color, track, children }: any) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const off = C * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track || P.tint} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || P.lime} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} style={{ transition: "stroke-dashoffset .6s cubic-bezier(.22,.61,.36,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- big circular countdown ring ---------- */
export function RingTimer({ pct, P, size = 232, stroke = 14, color, track, pulse, children }: any) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r;
  const off = C * (1 - Math.max(0, Math.min(1, pct)));
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: pulse ? `drop-shadow(0 0 10px ${color || P.actionDeep}66)` : "none" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track || P.tint} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color || P.ink} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1s linear" }} />
      </svg>
      <div style={{ position: "absolute", inset: stroke + 6, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

/* ---------- smooth area chart ---------- */
function smoothPath(vals: number[], w: number, h: number, pad: number) {
  const n = vals.length; if (n < 2) return { line: "", area: "", pts: [] as number[][] };
  const max = Math.max(...vals, 1);
  const xs = (i: number) => pad + (i * (w - 2 * pad)) / (n - 1);
  const ys = (v: number) => h - pad - (v / max) * (h - 2 * pad);
  const pts = vals.map((v, i) => [xs(i), ys(v)]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
  }
  const area = `${d} L ${pts[n - 1][0]} ${h - pad} L ${pts[0][0]} ${h - pad} Z`;
  return { line: d, area, pts };
}
export function AreaChart({ values, P, color, height = 96, labels, markerIdx }: any) {
  const w = 320, pad = 14;
  const { line, area, pts } = smoothPath(values, w, height, pad);
  const col = color || P.blue;
  const id = React.useMemo(() => "g" + Math.floor(Math.abs(values.reduce((a: number, b: number) => a + b, 0)) * 97 % 1e6).toString(36) + values.length, [values]);
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", height, display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity="0.20" />
            <stop offset="100%" stopColor={col} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={col} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        {pts && markerIdx != null && pts[markerIdx] && (
          <g>
            <circle cx={pts[markerIdx][0]} cy={pts[markerIdx][1]} r="6.5" fill={P.surface} stroke={col} strokeWidth="2.5" />
            <circle cx={pts[markerIdx][0]} cy={pts[markerIdx][1]} r="2.4" fill={P.ink} />
          </g>
        )}
      </svg>
      {labels && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${labels.length},1fr)`, marginTop: 6 }}>
          {labels.map((l: string, i: number) => <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: i === markerIdx ? P.ink : P.muted }}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

/* ---------- 7-segment progress ---------- */
export function SegBar({ total, filledTo, current, P, color }: any) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < filledTo, isCur = i === current;
        return <div key={i} style={{ height: 6, flex: 1, borderRadius: 9999, background: done ? P.ink : isCur ? (color || P.actionDeep) : P.borderStrong, transition: "background .3s" }} />;
      })}
    </div>
  );
}

/* ---------- toggle ---------- */
export function Toggle({ value, onChange, label, icon, P }: any) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: P.surface, borderRadius: 22, border: `1px solid ${P.border}`, boxShadow: SOFT_SHADOW }}>
      <span style={{ display: "flex", alignItems: "center", gap: 13, color: P.ink, fontSize: 15.5, fontWeight: 800 }}>
        <IconBadge icon={icon} P={P} tone="soft" size={34} />
        <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      </span>
      <span style={{ width: 50, height: 29, borderRadius: 9999, position: "relative", background: value ? P.successDeep : P.borderStrong, transition: "background .2s" }}>
        <span style={{ position: "absolute", top: 3, left: value ? 24 : 3, width: 23, height: 23, borderRadius: 9999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left .2s cubic-bezier(.22,.61,.36,1)" }} />
      </span>
    </button>
  );
}

/* ---------- pill tabs ---------- */
export function Tabs({ tabs, active, onChange, P }: any) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {tabs.map((t: string) => {
        const on = t === active;
        return (
          <button key={t} onClick={() => onChange(t)} style={{ flex: 1, padding: "11px 8px", borderRadius: 9999, fontSize: 13.5, fontWeight: 700, background: on ? P.action : P.surface, color: on ? P.onAction : P.text2, border: `1px solid ${on ? "transparent" : P.border}`, transition: "background .2s", boxShadow: on ? "none" : SOFT_SHADOW }}>{t}</button>
        );
      })}
    </div>
  );
}

/* ---------- exercise photo / figure card (the ABS card) ---------- */
export function PhotoCard({ ex, tone, P, illustration, scrubPct, time, big }: any) {
  const toneBg = ({ action: P.action, success: P.success, info: P.info } as Record<string, string>)[tone] || P.info;
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: big ? "1 / 1" : "20 / 17", background: toneBg, borderRadius: 30, overflow: "hidden", border: `1px solid ${P.border}`, boxShadow: "0 2px 4px rgba(20,18,12,0.05), 0 18px 40px rgba(20,18,12,0.08)" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0) 42%)" }} />
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 4 }}>
        <Pill P={P} tone="surface" style={{ boxShadow: "0 2px 10px rgba(20,18,12,0.12)" }}>{ex.name}</Pill>
      </div>
      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 4 }}>
        <Pill P={P} tone="soft" style={{ background: "rgba(255,255,255,0.7)", fontSize: 11.5, padding: "6px 11px" }}>{ex.zone}</Pill>
      </div>
      {illustration === "photo" ? (
        <ImageSlot id={exSlug(ex.name)} shape="rect" fit="contain" placeholder="Glisse une photo cutout" />
      ) : (
        <div style={{ position: "absolute", inset: "16% 8% 14%" }}>
          <ExerciseFigure id={ex.id} color={P.figure} />
        </div>
      )}
      {scrubPct != null && (
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, zIndex: 4, display: "flex", alignItems: "center", gap: 10 }}>
          <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: P.ink, background: "rgba(255,255,255,0.75)", padding: "3px 8px", borderRadius: 9999 }}>{time}</span>
          <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.55)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${scrubPct}%`, background: P.ink, borderRadius: 9999, transition: "width 1s linear" }} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Today's-activity list row ---------- */
export function ActivityRow({ pillTone, pillIcon, pillText, label, P, last }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: last ? "none" : `1px solid ${P.border}` }}>
      <Pill P={P} tone={pillTone} icon={pillIcon}>{pillText}</Pill>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: P.text2 }}>{label}</span>
    </div>
  );
}

/* ---------- Calendars ---------- */
export function PillCalendar({ sessions, P }: { sessions: Session[]; P: Palette }) {
  const today = new Date(); const days: { done: boolean; isToday: boolean; num: number }[] = [];
  for (let i = 27; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); const key = dateKey(d); days.push({ done: sessions.some((s) => s.date.startsWith(key)), isToday: i === 0, num: d.getDate() }); }
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8, marginBottom: 10 }}>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: P.muted }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {days.map((d, i) => {
          let bg = P.tint, bd = "transparent", fg = P.muted;
          if (d.done) { bg = P.success; fg = P.onSuccess; } else if (d.isToday) { bg = "transparent"; bd = P.actionDeep; fg = P.actionDeep; }
          return <div key={i} className="mono" style={{ aspectRatio: "1/1", borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", background: bg, border: `1.5px solid ${bd}`, fontSize: 12.5, fontWeight: 700, color: fg }}>{d.num}</div>;
        })}
      </div>
    </div>
  );
}
export function Heatmap({ sessions, P }: { sessions: Session[]; P: Palette }) {
  const today = new Date(); const cells: { done: boolean; isToday: boolean }[] = [];
  for (let i = 27; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); const key = dateKey(d); cells.push({ done: sessions.some((s) => s.date.startsWith(key)), isToday: i === 0 }); }
  const cols: { done: boolean; isToday: boolean }[][] = [[], [], [], []]; cells.forEach((c, i) => cols[Math.floor(i / 7)].push(c));
  return (
    <div>
      <div style={{ display: "flex", gap: 7 }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 7, flex: 1 }}>
            {col.map((c, ri) => <div key={ri} style={{ aspectRatio: "1/1", borderRadius: 8, background: c.done ? P.successDeep : P.tint, border: c.isToday ? `2px solid ${P.actionDeep}` : `1px solid ${P.border}` }} />)}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, justifyContent: "flex-end", color: P.muted, fontSize: 11, fontWeight: 600 }}>
        <span>Moins</span>
        <span style={{ width: 12, height: 12, borderRadius: 4, background: P.tint, border: `1px solid ${P.border}` }} />
        <span style={{ width: 12, height: 12, borderRadius: 4, background: P.success }} />
        <span style={{ width: 12, height: 12, borderRadius: 4, background: P.successDeep }} />
        <span>Plus</span>
      </div>
    </div>
  );
}

/* ---------- StatTile — colored card with a mini progress ring (ref 1) ---------- */
export function StatTile({ P, tone = "primary", icon, label, value, unit, pct }: any) {
  const bgMap: Record<string, string> = { primary: P.primary, action: P.action, accent: P.accent, info: P.infoDeep, dark: P.darkCard, soft: P.surface };
  const bg = bgMap[tone] || P.primary;
  const onDark = tone !== "soft";
  const fg = onDark ? "#fff" : P.ink;
  const sub = onDark ? "rgba(255,255,255,0.7)" : P.muted;
  const track = onDark ? "rgba(255,255,255,0.22)" : P.tint;
  const rc = onDark ? "#fff" : P.primaryDeep;
  return (
    <div style={{ background: bg, borderRadius: 26, padding: 16, border: `1px solid ${onDark ? "transparent" : P.border}`, boxShadow: CARD_SHADOW, position: "relative", overflow: "hidden", minHeight: 128, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: onDark ? "rgba(255,255,255,0.92)" : P.text2 }}>{label}</span>
        <span style={{ width: 30, height: 30, borderRadius: 9999, background: onDark ? "rgba(255,255,255,0.18)" : P.tint, display: "flex", alignItems: "center", justifyContent: "center", color: fg }}><Icon name={icon} size={16} /></span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 10 }}>
        <div className="mono" style={{ fontSize: 26, fontWeight: 800, color: fg, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {value}{unit && <span style={{ fontSize: 13.5, color: sub }}> {unit}</span>}
        </div>
        <DonutRing pct={pct} P={P} size={50} stroke={7} color={rc} track={track}>
          <span className="mono" style={{ fontSize: 10.5, fontWeight: 800, color: fg }}>{Math.round(pct * 100)}</span>
        </DonutRing>
      </div>
    </div>
  );
}

/* ---------- ExerciseRow — reference-style list item (light thumb + name + meta) ---------- */
export function ExerciseRow({ ex, P, illustration, metric, tone = "soft", onClick, arrow }: any) {
  const hasPhoto = !!photoForName(ex.name);
  const thumbBg = (illustration === "photo" || hasPhoto) ? "#FFFFFF" : (({ soft: P.tint, primary: P.primarySoft, accent: P.accentSoft, action: P.actionSoft, info: P.infoSoft, success: P.successSoft } as Record<string, string>)[tone] || P.tint);
  return (
    <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: 10, paddingRight: 14, background: P.surface, borderRadius: 22, border: `1px solid ${P.border}`, boxShadow: SOFT_SHADOW, textAlign: "left" }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: thumbBg, flexShrink: 0, overflow: "hidden", position: "relative", border: illustration === "photo" ? `1px solid ${P.border}` : "none" }}>
        <ExerciseVisual ex={ex} P={P} illustration={illustration} fit="contain" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, letterSpacing: "-0.01em", color: P.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4 }}>
          <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: P.actionDeep }}>{metric}</span>
          <span style={{ width: 3, height: 3, borderRadius: 9999, background: P.muted }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: P.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.zone}</span>
        </div>
      </div>
      {arrow && <span style={{ color: P.muted, flexShrink: 0 }}><Icon name="chevR" size={18} /></span>}
    </button>
  );
}

/* ---------- BottomNav — dark pill tab bar with center action (refs 1/2/3) ---------- */
export function BottomNav({ P, active, onNav, onStart }: any) {
  const tabs = [
    { id: "home", icon: "home" }, { id: "programs", icon: "grid" },
    { id: "start", center: true },
    { id: "history", icon: "chart" }, { id: "settings", icon: "user" },
  ];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))", paddingTop: 6, pointerEvents: "none", zIndex: 60 }}>
      <div style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 3, background: P.darkCard, borderRadius: 9999, padding: "8px 10px", boxShadow: "0 12px 30px rgba(10,8,20,0.3), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
        {tabs.map((t: any) => {
          if (t.center) {
            return (
              <button key={t.id} onClick={onStart} aria-label="Démarrer la séance" style={{ width: 54, height: 54, borderRadius: 9999, background: P.actionDeep, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 5px", boxShadow: `0 6px 16px ${P.actionDeep}77` }}>
                <Icon name="play" size={24} />
              </button>
            );
          }
          const on = t.id === active;
          return (
            <button key={t.id} onClick={() => onNav(t.id)} aria-label={t.id} style={{ width: 46, height: 46, borderRadius: 9999, background: on ? "rgba(255,255,255,0.14)" : "transparent", color: on ? "#fff" : "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s, color .2s" }}>
              <Icon name={t.icon} size={22} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
