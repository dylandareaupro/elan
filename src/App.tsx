/* ============================================================
   VENTRE PLAT — screens + app + mount (Dribbble-matched)
   Ported from app.jsx. Tweaks panel replaced by an in-app
   "Apparence" section (palette / illustrations / calendrier).
   ============================================================ */
import React from "react";
import {
  EXERCISES, WEEKS, DEFAULT_SETTINGS, PALETTES, EX_TONE,
  storageGet, storageSet, calculateStreak, sessionsThisWeek, weekActivity, fmt,
  makeSpeak, vibrate, beep, successChime, unlockAudio, requestWakeLock, releaseWakeLock,
  nextTikTokId, refreshTikTokPool, spotifyEmbed,
  figureForName, exSlug, photoForName,
  getProfile, setProfile, getPlans, setPlans, getActivePlanId, setActivePlanId,
  type Plan, type Profile, type Session, type Settings, type Palette,
} from "./lib/engine";
import { Icon } from "./components/Icon";
import { ExerciseFigure } from "./components/ExerciseFigure";
import { ImageSlot } from "./components/ImageSlot";
import { IOSDevice } from "./components/IOSDevice";
import { OnboardingFlow, CoachSheet } from "./components/coach/Coach";
import { Splash } from "./components/Splash";
import { enableReminders, disableReminders, celebrateWorkout, reportWorkout, pushSupported, isStandalone, type Reminder } from "./lib/push";
import { AnimatePresence } from "framer-motion";
import {
  RoundBtn, Eyebrow, IconBadge, Pill, CTA, GhostBtn, Card, WeekStrip,
  DonutRing, RingTimer, AreaChart, SegBar, Toggle, Tabs, ActivityRow, PillCalendar, Heatmap,
  StatTile, BottomNav, ExerciseRow, ExerciseVisual, CARD_SHADOW, SOFT_SHADOW,
} from "./components/ui";

const speak = makeSpeak();

interface Prefs { paletteName: string; illus: string; calName: string }
const DEFAULT_PREFS: Prefs = { paletteName: "Clair", illus: "Photo", calName: "Pills" };

function Shell({ children, P }: { children: React.ReactNode; P: Palette }) {
  return (
    <div className="vp-screen" style={{ minHeight: "100%", background: P.bg, color: P.ink, padding: "60px 20px 30px", display: "flex", flexDirection: "column" }}>{children}</div>
  );
}
function TopBar({ left, label, right, P }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, minHeight: 46 }}>
      <div style={{ minWidth: 46, display: "flex", gap: 8 }}>{left}</div>
      {label && <Eyebrow P={P}>{label}</Eyebrow>}
      <div style={{ minWidth: 46, display: "flex", justifyContent: "flex-end", gap: 8 }}>{right}</div>
    </div>
  );
}

const TONE_DEEP: Record<string, string> = { info: "infoDeep", success: "successDeep", action: "actionDeep", primary: "primaryDeep", accent: "accentDeep" };
function exMetric(ex: any, durSec: number) {
  if (ex.type === "reps") return `${Math.max(4, Math.round(durSec / (ex.repCycle || 1.5)))}×`;
  return `${durSec}s`;
}

/* ---------- Today / Séance du jour card (Immersif variant, frozen) ---------- */
function TodayCard({ P, plan, exs, totalSessionTime, currentWeek, illustration, heroPhoto, heroEx, onStart }: any) {
  const meta = (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 600 }}>
      <span className="mono">{Math.round(totalSessionTime / 60)} min</span><span style={{ opacity: 0.5 }}>·</span>
      <span>{exs.length} exos</span><span style={{ opacity: 0.5 }}>·</span>
      <span>{currentWeek.rounds} tours</span>
    </div>
  );
  return (
    <div style={{ position: "relative", marginTop: 20, background: P.primary, borderRadius: 30, padding: "22px 22px 22px", overflow: "hidden", boxShadow: `0 14px 34px ${P.primaryDeep}44`, minHeight: (heroPhoto || illustration === "photo") ? 210 : undefined }}>
      {heroPhoto ? (
        <img src={heroPhoto} alt={heroEx.name} style={{ position: "absolute", right: -6, bottom: 0, height: "92%", width: "62%", objectFit: "contain", objectPosition: "right bottom", zIndex: 0 }} />
      ) : illustration === "photo" ? (
        <>
          <ImageSlot id={exSlug(heroEx.name)} shape="rect" fit="cover" placeholder="Photo séance" style={{ zIndex: 0 }} />
          <div style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(90deg, ${P.primary} 4%, ${P.primary}F2 30%, ${P.primary}99 52%, ${P.primary}00 80%)`, pointerEvents: "none" }} />
        </>
      ) : null}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 46%)", pointerEvents: "none" }} />
      {!heroPhoto && illustration !== "photo" && (
        <div style={{ position: "absolute", right: -22, bottom: -18, width: 184, height: 164, opacity: 0.9 }}>
          <ExerciseFigure id={figureForName(heroEx.name)} color="#FFFFFF" />
        </div>
      )}
      <div style={{ position: "relative", zIndex: 2, maxWidth: 210 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)" }}>Séance du jour</div>
        <div className="vp-display" style={{ fontSize: 30, color: "#fff", marginTop: 8, lineHeight: 0.98 }}>{plan.title}</div>
        <div style={{ color: "rgba(255,255,255,0.85)", marginTop: 10 }}>{meta}</div>
      </div>
      <button onClick={onStart} style={{ position: "relative", zIndex: 2, marginTop: 18, display: "inline-flex", alignItems: "center", gap: 9, padding: "13px 22px", borderRadius: 9999, background: "#fff", color: P.primaryDeep, fontSize: 15.5, fontWeight: 800, boxShadow: "0 6px 18px rgba(0,0,0,0.14)" }}>
        <Icon name="play" size={18} /> Commencer
      </button>
    </div>
  );
}

/* mini bar chart for the dark card */
function BarRow({ values, P, todayIdx }: any) {
  const max = Math.max(...values, 1);
  const labels = ["L", "M", "M", "J", "V", "S", "D"];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 88, paddingTop: 8 }}>
      {values.map((v: number, i: number) => {
        const h = Math.max(6, (v / max) * 70);
        const on = i === todayIdx;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
            <div style={{ width: "100%", maxWidth: 22, height: h, borderRadius: 9999, background: on ? P.action : "rgba(255,255,255,0.16)" }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: on ? P.action : "rgba(242,240,246,0.45)" }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================== HOME ============================== */
function HomeScreen(c: any) {
  const { P, plan, exs, week, currentWeek, totalSessionTime, streak, weekDone, illustration, sessions, profile, freq } = c;
  const acts = weekActivity(sessions);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const totalMin = acts.reduce((a, b) => a + b, 0);
  const heroEx = exs[0];
  const heroPhoto = photoForName(heroEx.name);
  const firstName = (profile && profile.name) || "Champion";
  return (
    <div style={{ height: "100%", overflowY: "auto", background: P.bg, color: P.ink }} className="vp-screen">
      <div style={{ padding: "58px 20px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 9999, overflow: "hidden", background: P.primarySoft, position: "relative", flexShrink: 0, border: `1px solid ${P.border}` }}>
              <ImageSlot id="vp-avatar" shape="circle" focus="top" />
              <div className="vp-avatar-ph" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: P.primaryDeep, pointerEvents: "none" }}><Icon name="user" size={22} /></div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text2 }}>Bonjour 👋</div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>{firstName}</div>
            </div>
          </div>
          <RoundBtn icon="search" P={P} label="Coach" onClick={c.openCoach} dot />
        </div>

        <TodayCard P={P} plan={plan} exs={exs} totalSessionTime={totalSessionTime} currentWeek={currentWeek} illustration={illustration} heroPhoto={heroPhoto} heroEx={heroEx} onStart={c.startSession} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
          <StatTile P={P} tone="action" icon="flameF" label="Série" value={streak} unit={streak > 1 ? "jours" : "jour"} pct={Math.min(1, streak / 7)} />
          <StatTile P={P} tone="primary" icon="target" label="Cette semaine" value={`${weekDone}/${freq}`} unit="séances" pct={Math.min(1, weekDone / freq)} />
        </div>

        <div style={{ marginTop: 12 }}>
          <Card P={P} pad={18} radius={26}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 14.5, fontWeight: 800, textTransform: "capitalize", letterSpacing: "-0.01em" }}>{new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
              <Pill P={P} tone="soft" style={{ fontSize: 12, padding: "5px 11px" }}>{`Semaine ${week}/4`}</Pill>
            </div>
            <WeekStrip sessions={sessions} P={P} />
          </Card>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ background: P.darkCard, borderRadius: 26, padding: 20, color: "#F2F0F6", boxShadow: CARD_SHADOW, position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(242,240,246,0.6)" }}>Minutes cette semaine</div>
                <div className="mono" style={{ fontSize: 30, fontWeight: 800, marginTop: 4, letterSpacing: "-0.02em" }}>{totalMin}<span style={{ fontSize: 15, color: "rgba(242,240,246,0.5)" }}> min</span></div>
              </div>
              <span style={{ width: 38, height: 38, borderRadius: 9999, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: P.accent }}><Icon name="boltF" size={20} /></span>
            </div>
            <div style={{ marginTop: 6 }}>
              <BarRow values={acts} P={P} todayIdx={todayIdx} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Eyebrow P={P}>Au programme</Eyebrow>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: P.muted }}>{exs.length} exercices</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {exs.slice(0, 4).map((e: any, i: number) => (
              <ExerciseRow key={i} ex={e} P={P} illustration={illustration} metric={exMetric(e, currentWeek.duration)} tone={["primary", "accent", "action", "info"][i % 4]} onClick={c.startSession} arrow />
            ))}
          </div>
          {exs.length > 4 && <button onClick={() => c.go("programs")} style={{ width: "100%", marginTop: 10, padding: "13px", borderRadius: 9999, background: P.surface, border: `1px solid ${P.border}`, fontSize: 14, fontWeight: 700, color: P.text2, boxShadow: SOFT_SHADOW }}>Voir les {exs.length} exercices</button>}
        </div>
      </div>
    </div>
  );
}

/* ============================== PROGRAMS ============================== */
function ProgramsScreen(c: any) {
  const { P, plans, plan, illustration } = c;
  return (
    <div style={{ height: "100%", overflowY: "auto", background: P.bg, color: P.ink }} className="vp-screen">
      <div style={{ padding: "58px 20px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <Eyebrow P={P}>Mes programmes</Eyebrow>
            <h1 className="vp-display" style={{ margin: "8px 0 0", fontSize: 40, lineHeight: 0.92 }}>PROGRAMMES</h1>
          </div>
          <RoundBtn icon="plus" P={P} dark label="Nouveau" onClick={c.openCoach} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 22 }}>
          {plans.map((pl: Plan) => {
            const on = pl.id === plan.id;
            const w0 = pl.weeks[0];
            return (
              <div key={pl.id} style={{ background: P.surface, borderRadius: 26, border: `1.5px solid ${on ? P.primaryDeep : P.border}`, boxShadow: CARD_SHADOW, overflow: "hidden" }}>
                <div style={{ padding: "18px 18px 14px", background: on ? P.primary : P.surface, color: on ? "#fff" : P.ink, position: "relative", overflow: "hidden" }}>
                  {(() => {
                    const pho = photoForName(pl.exercises[0].name);
                    if (illustration === "photo") {
                      return (
                        <div style={{ position: "absolute", right: 14, top: 14, width: 76, height: 76, borderRadius: 16, overflow: "hidden", background: "#FFFFFF", border: `1px solid ${P.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.14)" }}>
                          {pho
                            ? <img src={pho} alt={pl.exercises[0].name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                            : <ImageSlot id={exSlug(pl.exercises[0].name)} shape="rect" fit="contain" />}
                        </div>
                      );
                    }
                    return on && <div style={{ position: "absolute", right: -10, top: 12, width: 96, height: 88, opacity: 0.85 }}><ExerciseFigure id={figureForName(pl.exercises[0].name)} color="#fff" /></div>;
                  })()}
                  <div style={{ position: "relative", maxWidth: 220 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {on && <Pill P={P} tone="surface" style={{ fontSize: 11, padding: "4px 10px" }}>Actif</Pill>}
                      <span style={{ fontSize: 11.5, fontWeight: 700, opacity: on ? 0.8 : 0.55 }}>{new Date(pl.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                    </div>
                    <div className="vp-display" style={{ fontSize: 25, marginTop: 8, lineHeight: 0.98 }}>{pl.title}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 12, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>
                      <span className="mono">{pl.durationMin} min</span><span style={{ opacity: 0.5 }}>·</span>
                      <span className="mono">{pl.exercises.length} exos</span><span style={{ opacity: 0.5 }}>·</span>
                      <span className="mono">{w0.duration}s/exo</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {pl.focusZones.slice(0, 4).map((z) => <Pill key={z} P={P} tone="soft" style={{ fontSize: 11.5, padding: "5px 11px" }}>{z}</Pill>)}
                </div>
                <div style={{ display: "flex", gap: 8, padding: "0 12px 12px" }}>
                  {!on && <button onClick={() => c.switchPlan(pl.id)} style={{ flex: 1, padding: "12px", borderRadius: 9999, background: P.tint, color: P.ink, fontSize: 14, fontWeight: 700 }}>Activer</button>}
                  <button onClick={() => { c.switchPlan(pl.id); c.startSession(); }} style={{ flex: 1, padding: "12px", borderRadius: 9999, background: P.primaryDeep, color: "#fff", fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Icon name="play" size={16} /> Démarrer</button>
                </div>
              </div>
            );
          })}
          <button onClick={c.openCoach} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, padding: "18px", borderRadius: 26, background: "transparent", border: `1.5px dashed ${P.borderStrong}`, color: P.text2, fontSize: 14.5, fontWeight: 700 }}>
            <Icon name="plus" size={18} /> Créer un nouveau programme
          </button>
        </div>
      </div>
    </div>
  );
}

/* TikTok player shown during gainage (hold) exercises. Online-only; the parent
   only mounts it when there are video ids, so offline we fall back to the figure.
   A new clip is picked per exercise (keyed by exIndex).
   We drive it via the TikTok Embed Player API (postMessage): on ready we force
   play + sound on (autoplay starts muted otherwise), and when a clip ends
   (loop=0 → onStateChange value 0) we ask the parent for the next one so the
   distraction keeps rolling until the gainage timer runs out. */
function HoldTikTok({ videoId, onEnded }: { videoId: string; onEnded?: () => void }) {
  const src = `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=0&controls=1&description=0&music_info=0&rel=0`;
  const ref = React.useRef<HTMLIFrameElement>(null);
  const endedRef = React.useRef(onEnded);
  endedRef.current = onEnded;
  React.useEffect(() => {
    let done = false; // guard against the ended event firing more than once
    const send = (type: string, value?: any) =>
      ref.current?.contentWindow?.postMessage({ type, value, "x-tiktok-player": true }, "*");
    function onMsg(e: MessageEvent) {
      if (typeof e.origin === "string" && !e.origin.endsWith("tiktok.com")) return;
      let d: any = e.data;
      if (typeof d === "string") { try { d = JSON.parse(d); } catch { return; } }
      if (!d || d["x-tiktok-player"] !== true) return;
      if (d.type === "onPlayerReady") { send("play"); send("unMute"); }
      if (d.type === "onStateChange" && d.value === 0 && !done) { done = true; endedRef.current?.(); }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [videoId]);
  return (
    <iframe ref={ref} key={videoId} src={src} title="TikTok" allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, background: "#000" }} />
  );
}

/* ============================== WORKOUT ============================== */
function WorkoutScreen(c: any) {
  const { P, round, currentWeek, week, exIndex, current, exs, timeLeft, paused, progress, currentReps, targetReps, nextLabel, illustration, settings } = c;
  const tone = EX_TONE[exIndex % EX_TONE.length];
  const ringColor = P[TONE_DEEP[tone]];
  const last3 = timeLeft <= 3;
  const exPhoto = photoForName(current.name);
  const repPct = current.type === "reps" && targetReps ? currentReps / targetReps : 0;
  const holdVideoId = c.holdVideoId;
  const showTikTok = !!settings.distraction && current.type === "time" && !!holdVideoId;
  const onDark = showTikTok; // light text + scrim when a video fills the card
  return (
    <Shell P={P}>
      <TopBar P={P}
        left={<Pill P={P} tone="surface" icon="bolt">Tour {round} / {currentWeek.rounds} · S{week}</Pill>}
        right={<RoundBtn icon={paused ? "play" : "pause"} P={P} label="Pause" onClick={c.togglePause} />} />

      <div style={{ marginBottom: 8 }}>
        <SegBar P={P} total={exs.length} filledTo={exIndex} current={exIndex} color={ringColor} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, marginBottom: 10 }}>
        <Eyebrow P={P} style={{ whiteSpace: "nowrap" }}>Exercice {exIndex + 1} / {exs.length}</Eyebrow>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: P.muted }}>{current.zone}</span>
      </div>

      <div onClick={showTikTok ? undefined : c.togglePause} title={paused ? "Reprendre" : "Mettre en pause"} style={{ position: "relative", width: "100%", flex: 1, minHeight: 0, cursor: showTikTok ? "default" : "pointer", background: showTikTok ? "#000" : exPhoto ? "#FFFFFF" : P[EX_TONE[exIndex % EX_TONE.length] + "Soft"] || P.primarySoft, borderRadius: 30, overflow: "hidden", border: `1px solid ${P.border}`, boxShadow: "0 2px 4px rgba(20,18,12,0.05), 0 18px 40px rgba(20,18,12,0.08)" }}>
        {showTikTok ? (
          <HoldTikTok videoId={holdVideoId} onEnded={c.onHoldEnded} />
        ) : (
          <div style={{ position: "absolute", inset: exPhoto ? "2%" : "10% 8%", zIndex: 0 }}>
            <ExerciseVisual ex={current} P={P} illustration={illustration} fit="contain" />
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: onDark ? "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0) 32%)" : "linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0) 38%)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 16, left: 16, right: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, zIndex: 2, pointerEvents: "none" }}>
          <div style={{ minWidth: 0 }}>
            <h2 className="vp-display" style={{ margin: 0, fontSize: 26, lineHeight: 0.98, color: onDark ? "#fff" : P.ink, textShadow: onDark ? "0 2px 10px rgba(0,0,0,0.5)" : "none" }}>{current.name}</h2>
            <p style={{ margin: "5px 0 0", fontSize: 13, fontWeight: 600, color: onDark ? "rgba(255,255,255,0.85)" : P.text2, maxWidth: 200, textShadow: onDark ? "0 1px 6px rgba(0,0,0,0.5)" : "none" }}>{current.info}</p>
          </div>
          {paused && <Pill P={P} tone="ink" icon="pause" style={{ flexShrink: 0 }}>Pause</Pill>}
        </div>
        {current.type === "reps" && (
          <div style={{ position: "absolute", bottom: 14, left: 16, zIndex: 2 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: P.ink, color: "#fff", borderRadius: 9999, padding: "9px 16px 9px 13px", boxShadow: "0 6px 16px rgba(20,18,12,0.2)" }}>
              <Icon name="refresh" size={16} />
              <span className="mono" style={{ fontSize: 17, fontWeight: 800 }}>{currentReps}<span style={{ opacity: 0.5 }}> / {targetReps}</span></span>
              <span style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.7 }}>reps</span>
            </div>
          </div>
        )}
        {timeLeft > 0 && last3 && !paused && (
          <div style={{ position: "absolute", inset: 0, zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.5)", backdropFilter: "blur(1.5px)", WebkitBackdropFilter: "blur(1.5px)" }}>
            <div key={timeLeft} className="vp-count-pop mono" style={{ fontSize: 152, fontWeight: 800, lineHeight: 1, color: P.actionDeep, textShadow: "0 8px 28px rgba(20,18,12,0.22)" }}>{timeLeft}</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 18 }}>
        <DonutRing pct={current.type === "reps" ? repPct : progress / 100} P={P} size={72} stroke={9} color={last3 ? P.actionDeep : ringColor}>
          <Icon name="clock" size={22} color={last3 ? P.actionDeep : P.ink} />
        </DonutRing>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 50, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.9, color: last3 ? P.actionDeep : P.ink, transition: "color .2s" }}>{fmt(timeLeft)}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, color: P.text2, fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: P.muted }}>Suivant</span>
            <Icon name="arrowR" size={14} color={P.muted} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nextLabel()}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <GhostBtn P={P} onClick={c.reset} icon="x" />
        <CTA P={P} ctaStyle="peach" icon="skip" onClick={c.handleNext}>Passer</CTA>
      </div>
    </Shell>
  );
}

/* ============================== REST ============================== */
function RestScreen(c: any) {
  const { P, round, currentWeek, week, exs, timeLeft, progress, paused, nextLabel } = c;
  return (
    <Shell P={P}>
      <TopBar P={P}
        left={<Pill P={P} tone="surface" icon="drop">Tour {round} / {currentWeek.rounds} · S{week}</Pill>}
        right={<RoundBtn icon={paused ? "play" : "pause"} P={P} label="Pause" onClick={c.togglePause} />} />

      <div style={{ marginBottom: 8 }}>
        <SegBar P={P} total={exs.length} filledTo={exs.length} current={-1} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <RingTimer pct={progress / 100} P={P} size={252} stroke={15} color={P.successDeep} track={P.successSoft}>
          <Eyebrow P={P} color={P.successDeep}>Pause</Eyebrow>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em", marginTop: 4 }}>Repos</div>
          <div className="mono" style={{ fontSize: 30, fontWeight: 800, color: P.successDeep, marginTop: 6 }}>{fmt(timeLeft)}</div>
        </RingTimer>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: P.text2 }}>Respire, hydrate-toi.</p>
          <div style={{ marginTop: 14 }}><Pill P={P} tone="success" icon="arrowR">Tour {round + 1} · {nextLabel()}</Pill></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <GhostBtn P={P} onClick={c.reset} icon="x" />
        <CTA P={P} ctaStyle="peach" icon="skip" onClick={c.handleNext}>Passer</CTA>
      </div>
    </Shell>
  );
}

/* ============================== TRANSITION (between exercises) ============================== */
function TransitionScreen(c: any) {
  const { P, round, currentWeek, week, exIndex, exs, timeLeft, illustration, settings } = c;
  const nextEx = exs[exIndex + 1] || exs[0];
  const exPhoto = photoForName(nextEx.name);
  const auto = settings.autoAdvance;
  return (
    <Shell P={P}>
      <TopBar P={P}
        left={<Pill P={P} tone="surface" icon="arrowR">Tour {round} / {currentWeek.rounds} · S{week}</Pill>}
        right={<RoundBtn icon="x" P={P} label="Quitter" onClick={c.reset} />} />

      <div style={{ marginBottom: 8 }}>
        <SegBar P={P} total={exs.length} filledTo={exIndex + 1} current={exIndex + 1} color={P.primaryDeep} />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <Eyebrow P={P} color={P.primaryDeep}>Prochain exercice</Eyebrow>
        <h1 className="vp-display" style={{ margin: "8px 0 0", fontSize: 34, lineHeight: 1.0, color: P.ink }}>{nextEx.name}</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 600, color: P.text2, maxWidth: 240 }}>{nextEx.info}</p>

        <div style={{ position: "relative", width: 200, height: 200, margin: "22px 0 0", borderRadius: 28, overflow: "hidden", background: exPhoto ? "#FFFFFF" : P.primarySoft, border: `1px solid ${P.border}` }}>
          <div style={{ position: "absolute", inset: exPhoto ? "4%" : "12%" }}>
            <ExerciseVisual ex={nextEx} P={P} illustration={illustration} fit="contain" />
          </div>
        </div>

        {auto && (
          <div className="mono" style={{ marginTop: 22, fontSize: 64, fontWeight: 800, letterSpacing: "-0.04em", color: P.primaryDeep, lineHeight: 1 }}>
            {Math.max(0, timeLeft)}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <GhostBtn P={P} onClick={c.reset} icon="x" />
        <CTA P={P} ctaStyle="peach" icon="play" onClick={c.handleNext}>{auto ? "Commencer maintenant" : "Commencer"}</CTA>
      </div>
    </Shell>
  );
}

/* ============================== DONE ============================== */
function DoneScreen(c: any) {
  const { P, streak, week, elapsed, currentWeek, exs } = c;
  return (
    <Shell P={P}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 88, height: 88, margin: "0 auto", borderRadius: 9999, background: P.success, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 30px ${P.successDeep}40` }}>
            <Icon name="check" size={42} color={P.ink} stroke={2.8} />
          </div>
          <h1 style={{ margin: "20px 0 0", fontSize: 48, fontWeight: 800, letterSpacing: "-0.035em" }}>Terminé.</h1>
          <p style={{ margin: "10px 0 0", color: P.text2, fontSize: 15.5, fontWeight: 600 }}>Bien joué — séance bouclée.</p>
        </div>

        <Card P={P} pad={6} radius={26}>
          <div style={{ padding: "4px 16px" }}>
            <ActivityRow P={P} pillTone="action" pillIcon="flameF" pillText={`${streak} j`} label="Série en cours" />
            <ActivityRow P={P} pillTone="info" pillIcon="clock" pillText={fmt(elapsed)} label="Durée" />
            <ActivityRow P={P} pillTone="success" pillIcon="medal" pillText={`Semaine ${week}`} label={currentWeek.label} last />
          </div>
        </Card>

        <div style={{ position: "relative", background: P.darkCard, borderRadius: 26, padding: "22px", color: "#F2F0EC", overflow: "hidden", boxShadow: "0 18px 40px rgba(20,18,12,0.25)" }}>
          <div style={{ position: "absolute", right: -28, top: -18, width: 140, height: 140, opacity: 0.18 }}><ExerciseFigure id="twist" color="#fff" /></div>
          <Eyebrow P={P} color={P.action}>{c.plan.title} · {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 16 }}>
            {[["Durée", fmt(elapsed)], ["Tours", String(currentWeek.rounds)], ["Exos", String(exs.length * currentWeek.rounds)]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(242,240,236,0.5)" }}>{l}</div>
                <div className="mono" style={{ fontSize: 23, fontWeight: 800, marginTop: 5 }}>{v}</div>
              </div>
            ))}
          </div>
          <button onClick={c.share} style={{ marginTop: 18, width: "100%", padding: "12px", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(242,240,236,0.12)", color: "#F2F0EC", fontSize: 13.5, fontWeight: 700 }}>
            <Icon name="share" size={16} /> Partager ma séance
          </button>
        </div>
      </div>

      <div style={{ marginTop: 28 }}>
        <GhostBtn P={P} onClick={() => c.go("home")}>Retour accueil</GhostBtn>
      </div>
    </Shell>
  );
}

/* ============================== HISTORY ============================== */
function HistoryScreen(c: any) {
  const { P, sessions, streak, calStyle, freq } = c;
  const recent = sessions.slice(-5).reverse();
  const acts = weekActivity(sessions);
  const todayIdx = (new Date().getDay() + 6) % 7;
  const [period, setPeriod] = React.useState("30 j");
  const days = period === "7 j" ? 7 : period === "90 j" ? 90 : 30;
  const since = new Date(); since.setDate(since.getDate() - days);
  const inPeriod = sessions.filter((s: Session) => new Date(s.date) >= since);
  const totalMin = Math.round(inPeriod.reduce((a: number, s: Session) => a + (s.duration || 0), 0) / 60);
  const goalSessions = Math.max(1, Math.round(freq * (days / 7)));
  const pct = Math.min(1, inPeriod.length / goalSessions);
  return (
    <div style={{ height: "100%", overflowY: "auto", background: P.bg, color: P.ink }} className="vp-screen">
      <div style={{ padding: "58px 20px 120px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <Eyebrow P={P}>Tes résultats</Eyebrow>
            <h1 className="vp-display" style={{ margin: "8px 0 0", fontSize: 40, lineHeight: 0.92 }}>PROGRÈS</h1>
          </div>
          <RoundBtn icon="share" P={P} label="Partager" onClick={c.share} />
        </div>

        <div style={{ marginTop: 18 }}>
          <Tabs tabs={["7 j", "30 j", "90 j"]} active={period} onChange={setPeriod} P={P} />
        </div>

        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <RingTimer pct={pct} P={P} size={232} stroke={16} color={P.primaryDeep} track={P.tint}>
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, borderRadius: 9999, background: P.actionSoft, color: P.actionDeep, marginBottom: 6 }}><Icon name="flameF" size={22} /></span>
            <div className="mono" style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>{totalMin}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: P.muted, marginTop: 2 }}>minutes · {period}</div>
          </RingTimer>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 18 }}>
          <div style={{ background: P.surface, borderRadius: 24, padding: 16, border: `1px solid ${P.border}`, boxShadow: CARD_SHADOW, display: "flex", alignItems: "center", gap: 14 }}>
            <DonutRing pct={pct} P={P} size={58} stroke={8} color={P.accentDeep}>
              <span className="mono" style={{ fontSize: 14, fontWeight: 800 }}>{inPeriod.length}</span>
            </DonutRing>
            <div><div className="mono" style={{ fontSize: 20, fontWeight: 800 }}>{inPeriod.length}</div><div style={{ fontSize: 12, fontWeight: 700, color: P.text2 }}>Séances</div></div>
          </div>
          <div style={{ background: P.surface, borderRadius: 24, padding: 16, border: `1px solid ${P.border}`, boxShadow: CARD_SHADOW, display: "flex", alignItems: "center", gap: 14 }}>
            <DonutRing pct={Math.min(1, streak / 7)} P={P} size={58} stroke={8} color={P.actionDeep}>
              <Icon name="flameF" size={18} color={P.actionDeep} />
            </DonutRing>
            <div><div className="mono" style={{ fontSize: 20, fontWeight: 800 }}>{streak}</div><div style={{ fontSize: 12, fontWeight: 700, color: P.text2 }}>Série (j)</div></div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <Card P={P} tone="alt" pad={20} radius={26}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <Eyebrow P={P}>Minutes cette semaine</Eyebrow>
              <Pill P={P} tone="primary" icon="up" style={{ fontSize: 11.5, padding: "4px 9px 4px 7px" }}>{acts.reduce((a, b) => a + b, 0)} min</Pill>
            </div>
            <AreaChart values={acts.map((v) => v || 0.4)} P={P} color={P.primaryDeep} height={92} labels={["L", "M", "M", "J", "V", "S", "D"]} markerIdx={todayIdx} />
          </Card>
        </div>

        <div style={{ marginTop: 12 }}>
          <Card P={P} pad={22} radius={26}>
            <Eyebrow P={P}>{calStyle === "heatmap" ? "28 derniers jours" : "Ce mois-ci"}</Eyebrow>
            <div style={{ marginTop: 16 }}>{calStyle === "heatmap" ? <Heatmap sessions={sessions} P={P} /> : <PillCalendar sessions={sessions} P={P} />}</div>
          </Card>
        </div>

        <div style={{ marginTop: 12 }}>
          {sessions.length === 0 ? (
            <Card P={P} pad={26} radius={26}>
              <div style={{ textAlign: "center", color: P.text2 }}>
                <div style={{ margin: "0 auto 14px", width: 52, height: 52 }}><IconBadge icon="flame" P={P} tone="soft" size={52} /></div>
                <div style={{ fontWeight: 800, fontSize: 16, color: P.ink }}>Aucune séance, pour l'instant.</div>
                <div style={{ fontSize: 13.5, marginTop: 6 }}>Lance ta première et reviens voir ta série grandir.</div>
              </div>
            </Card>
          ) : (
            <Card P={P} pad={20} radius={26}>
              <Eyebrow P={P}>5 dernières séances</Eyebrow>
              <div style={{ marginTop: 12 }}>
                {recent.map((s: Session, i: number) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: i ? `1px solid ${P.border}` : "none" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <IconBadge icon="check" P={P} tone="success" size={32} />
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 800, textTransform: "capitalize", color: P.ink }}>{new Date(s.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</div>
                        {s.plan && <div style={{ fontSize: 11.5, fontWeight: 600, color: P.muted }}>{s.plan}</div>}
                      </div>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Pill P={P} tone="soft" style={{ padding: "4px 10px", fontSize: 11.5 }}>S{s.week}</Pill>
                      <span className="mono" style={{ fontSize: 13.5, fontWeight: 700, color: P.text2 }}>{fmt(s.duration)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- segmented control for in-app appearance settings ---------- */
function Segmented({ value, options, onChange, P }: any) {
  return (
    <div style={{ display: "flex", gap: 6, background: P.tint, borderRadius: 9999, padding: 4 }}>
      {options.map((o: string) => {
        const on = o === value;
        return <button key={o} onClick={() => onChange(o)} style={{ flex: 1, padding: "9px 6px", borderRadius: 9999, fontSize: 13, fontWeight: 700, background: on ? P.surface : "transparent", color: on ? P.ink : P.text2, boxShadow: on ? SOFT_SHADOW : "none", transition: "background .2s" }}>{o}</button>;
      })}
    </div>
  );
}

/* Workout reminders — Web Push subscription + day/time picker */
const REM_DAYS: [string, string][] = [["Mon", "L"], ["Tue", "M"], ["Wed", "M"], ["Thu", "J"], ["Fri", "V"], ["Sat", "S"], ["Sun", "D"]];
function RemindersPanel({ P, settings, setSetting }: any) {
  const days: string[] = settings.reminderDays || ["Mon", "Wed", "Fri"];
  const time: string = settings.reminderTime || "18:00";
  const on: boolean = !!settings.reminderOn;
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string>("");
  const supported = pushSupported();
  const iosNeedsInstall = !isStandalone() && /iphone|ipad|ipod/i.test(navigator.userAgent);

  async function sync(nextDays: string[], nextTime: string) {
    setBusy(true); setMsg("");
    try {
      await enableReminders({ days: nextDays, time: nextTime } as Reminder);
      setSetting("reminderOn", true);
      setMsg("Rappels activés ✓");
    } catch (e: any) {
      setSetting("reminderOn", false);
      if (e?.message === "denied") setMsg("Notifications refusées. Autorise-les dans les réglages iPhone.");
      else if (e?.message === "unsupported") setMsg("Push non supporté sur ce navigateur.");
      else if (e?.message === "server") setMsg("Stockage non configuré côté serveur (voir setup).");
      else setMsg("Impossible d'activer les rappels.");
    } finally { setBusy(false); }
  }

  async function toggle(v: boolean) {
    if (v) {
      if (iosNeedsInstall) { setMsg("Ajoute d'abord l'app à l'écran d'accueil (Partager → Sur l'écran d'accueil), puis rouvre-la."); return; }
      await sync(days, time);
    } else {
      setBusy(true);
      try { await disableReminders(); } catch { /* ignore */ }
      setSetting("reminderOn", false); setMsg(""); setBusy(false);
    }
  }
  function toggleDay(code: string) {
    const next = days.includes(code) ? days.filter((d) => d !== code) : [...days, code];
    setSetting("reminderDays", next);
    if (on) sync(next, time);
  }
  function setTime(t: string) { setSetting("reminderTime", t); if (on) sync(days, t); }

  return (
    <div style={{ marginTop: 26 }}>
      <Eyebrow P={P}>Rappels</Eyebrow>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        <Toggle P={P} icon="bell" label="Rappels de séance" value={on} onChange={toggle} />
        {!supported && <p style={{ fontSize: 12, color: P.muted, margin: "0 4px", lineHeight: 1.45 }}>Notifications non supportées par ce navigateur.</p>}
        {supported && (
          <>
            <div style={{ display: "flex", gap: 6 }}>
              {REM_DAYS.map(([code, label]) => {
                const sel = days.includes(code);
                return (
                  <button key={code} onClick={() => toggleDay(code)} disabled={busy}
                    style={{ flex: 1, aspectRatio: "1", borderRadius: 14, fontSize: 14, fontWeight: 800, background: sel ? P.primaryDeep : P.tint, color: sel ? "#fff" : P.text2, border: "none", transition: "background .15s" }}>
                    {label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: P.surface, borderRadius: 16, padding: "12px 16px", border: `1px solid ${P.border}` }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: P.ink }}>Heure du rappel</span>
              <input type="time" value={time} disabled={busy} onChange={(e) => setTime(e.target.value)}
                style={{ fontSize: 16, fontWeight: 800, color: P.primaryDeep, background: P.tint, border: "none", borderRadius: 10, padding: "6px 10px", fontFamily: "inherit" }} />
            </div>
            {iosNeedsInstall && <p style={{ fontSize: 12, color: P.accentDeep || P.muted, margin: "0 4px", lineHeight: 1.45 }}>📲 Sur iPhone : ajoute l'app à l'écran d'accueil pour recevoir les notifications.</p>}
            {msg && <p style={{ fontSize: 12, color: P.muted, margin: "0 4px", lineHeight: 1.45 }}>{msg}</p>}
          </>
        )}
      </div>
    </div>
  );
}

/* ============================== SETTINGS / PROFIL ============================== */
function SettingsScreen(c: any) {
  const { P, settings, week, profile, prefs, setPref } = c;
  const prof = profile || {};
  return (
    <div style={{ height: "100%", overflowY: "auto", background: P.bg, color: P.ink }} className="vp-screen">
      <div style={{ padding: "58px 20px 120px" }}>
        <Eyebrow P={P}>Ton profil</Eyebrow>
        <h1 className="vp-display" style={{ margin: "8px 0 0", fontSize: 40, lineHeight: 0.92 }}>PROFIL</h1>

        <div style={{ marginTop: 18, background: P.surface, borderRadius: 26, padding: 18, border: `1px solid ${P.border}`, boxShadow: CARD_SHADOW }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 58, height: 58, borderRadius: 9999, overflow: "hidden", background: P.primarySoft, position: "relative", flexShrink: 0 }}>
              <ImageSlot id="vp-avatar" shape="circle" focus="top" />
              <div className="vp-avatar-ph" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: P.primaryDeep, pointerEvents: "none" }}><Icon name="user" size={26} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>{prof.name || "Mon profil"}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text2, marginTop: 2 }}>{prof.level || "Intermédiaire"} · {prof.frequency || 4}×/sem.</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
            {[["Âge", prof.age || "—", "ans", "primary"], ["Taille", prof.height || "—", "cm", "info"], ["Poids", prof.weight || "—", "kg", "accent"]].map(([l, v, u, tn]: any) => (
              <div key={l} style={{ background: ({ primary: P.primarySoft, info: P.infoSoft, accent: P.accentSoft } as Record<string, string>)[tn], borderRadius: 16, padding: "12px 10px", textAlign: "center" }}>
                <div className="mono" style={{ fontSize: 20, fontWeight: 800 }}>{v}<span style={{ fontSize: 11, color: P.muted }}> {u}</span></div>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.text2, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
          <button onClick={c.openCoach} style={{ width: "100%", marginTop: 12, padding: "12px", borderRadius: 9999, background: P.tint, color: P.ink, fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}><Icon name="boltF" size={16} /> Parler à mon coach</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>
          <Eyebrow P={P} style={{ marginBottom: 4 }}>Préférences</Eyebrow>
          <Toggle P={P} icon="volume" label="Voice coach" value={settings.voice} onChange={(v: boolean) => c.setSetting("voice", v)} />
          <Toggle P={P} icon={settings.sound ? "volume" : "volumeX"} label="Bips sonores" value={settings.sound} onChange={(v: boolean) => c.setSetting("sound", v)} />
          <Toggle P={P} icon="vibrate" label="Vibrations" value={settings.vibration} onChange={(v: boolean) => c.setSetting("vibration", v)} />
          <Toggle P={P} icon="refresh" label="Enchaînement auto" value={settings.autoAdvance} onChange={(v: boolean) => c.setSetting("autoAdvance", v)} />
          <p style={{ fontSize: 12, color: P.muted, margin: "-2px 4px 0", lineHeight: 1.45 }}>
            Auto : les exercices s'enchaînent après une pause de 3 s. Désactive pour lancer chaque exercice à la main.
          </p>
          <Toggle P={P} icon="play" label="Divertissement en séance" value={settings.distraction !== false} onChange={(v: boolean) => c.setSetting("distraction", v)} />
          <p style={{ fontSize: 12, color: P.muted, margin: "-2px 4px 0", lineHeight: 1.45 }}>
            Lecteur Spotify « Top 50 France » pendant la séance (bouton vert), et vidéos TikTok pendant le gainage (ajoute tes liens TikTok pour activer cette partie).
          </p>
        </div>

        <RemindersPanel P={P} settings={settings} setSetting={c.setSetting} />

        {/* in-app appearance (replaces the prototype Tweaks panel) */}
        <div style={{ marginTop: 26 }}>
          <Eyebrow P={P}>Apparence</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: P.ink, marginBottom: 8 }}>Palette</div>
              <Segmented P={P} value={prefs.paletteName} options={["Clair", "Crème", "Brume"]} onChange={(v: string) => setPref("paletteName", v)} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: P.ink, marginBottom: 8 }}>Illustrations</div>
              <Segmented P={P} value={prefs.illus} options={["Photo", "Line art"]} onChange={(v: string) => setPref("illus", v)} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: P.ink, marginBottom: 8 }}>Calendrier</div>
              <Segmented P={P} value={prefs.calName} options={["Pills", "Heatmap"]} onChange={(v: string) => setPref("calName", v)} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 26 }}>
          <Eyebrow P={P}>Programme · {c.plan.title}</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {c.plan.weeks.map((w: any) => {
              const active = week === w.week;
              return (
                <button key={w.week} onClick={() => c.setWeek(w.week)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 16px", borderRadius: 22, textAlign: "left", background: active ? P.actionSoft : P.surface, border: `1.5px solid ${active ? P.actionDeep : P.border}`, boxShadow: SOFT_SHADOW, transition: "background .2s, border-color .2s" }}>
                  <IconBadge icon={["bolt", "drop", "flameF", "medal"][w.week - 1]} P={P} tone={active ? "actionDeep" : "soft"} size={38} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15.5 }}>Semaine {w.week} · {w.label}</div>
                    <div className="mono" style={{ fontSize: 12, color: P.muted, marginTop: 3, whiteSpace: "nowrap" }}>{w.duration}s · repos {w.rest}s · {w.rounds} tours</div>
                  </div>
                  {active && <span style={{ width: 26, height: 26, borderRadius: 9999, background: P.actionDeep, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="check" size={15} color="#fff" stroke={2.8} /></span>}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 13, color: P.muted, marginTop: 14, lineHeight: 1.5 }}>Progression auto : 5 séances dans la semaine → passage au niveau suivant.</p>
        </div>

        <button onClick={c.resetHistory} style={{ marginTop: 20, width: "100%", padding: "14px 20px", fontSize: 13.5, fontWeight: 700, color: P.coral }}>Réinitialiser l'historique</button>
      </div>
    </div>
  );
}

/* ============================== APP ============================== */
function App() {
  const [prefs, setPrefsState] = React.useState<Prefs>(() => storageGet<Prefs>("prefs", DEFAULT_PREFS));
  const setPref = (k: keyof Prefs, v: string) => setPrefsState((p) => { const np = { ...p, [k]: v }; storageSet("prefs", np); return np; });

  const P = PALETTES[prefs.paletteName] || PALETTES.Clair;
  const illustration = prefs.illus === "Photo" ? "photo" : "lineart";
  const ctaStyle = "peach"; // frozen
  const calStyle = prefs.calName === "Heatmap" ? "heatmap" : "pills";
  const fontFamily = "'Hanken Grotesk', system-ui, sans-serif";

  React.useEffect(() => {
    document.documentElement.style.setProperty("--vp-display-font", "'Archivo'");
    refreshTikTokPool(); // récupère la liste TikTok fraîche (cron hebdo) en arrière-plan
  }, []);

  const [settings, setSettings] = React.useState<Settings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [loaded, setLoaded] = React.useState(false);
  const [profile, setProfileState] = React.useState<Profile | null>(null);
  const [plans, setPlansState] = React.useState<Plan[]>([]);
  const [activeId, setActiveIdState] = React.useState<string | null>(null);
  const [showCoach, setShowCoach] = React.useState(false);

  const [screen, setScreen] = React.useState("home");
  const [week, setWeekState] = React.useState(1);
  const [round, setRound] = React.useState(1);
  const [exIndex, setExIndex] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const [exElapsed, setExElapsed] = React.useState(0);
  const [sessionStart, setSessionStart] = React.useState<string | null>(null);

  React.useEffect(() => {
    const s = storageGet<Settings>("settings", DEFAULT_SETTINGS);
    setSettings(s); setSessions(storageGet<Session[]>("sessions", [])); setWeekState(s.currentWeek || 1);
    setProfileState(getProfile()); setPlansState(getPlans()); setActiveIdState(getActivePlanId()); setLoaded(true);
  }, []);
  React.useEffect(() => { if (loaded) storageSet("settings", settings); }, [settings, loaded]);

  const activePlan = plans.find((p) => p.id === activeId) || plans[0] || null;
  const EXS = activePlan ? activePlan.exercises : EXERCISES;
  const WKS = activePlan ? activePlan.weeks : WEEKS;
  const needOnboarding = loaded && (!profile || plans.length === 0);

  const currentWeek = WKS[week - 1] || WKS[0];
  const current = EXS[exIndex] || EXS[0];
  const totalDur = screen === "rest" ? currentWeek.rest : currentWeek.duration;
  const progress = totalDur ? ((totalDur - timeLeft) / totalDur) * 100 : 0;
  const totalSessionTime = currentWeek.rounds * EXS.length * currentWeek.duration + (currentWeek.rounds - 1) * currentWeek.rest;
  const streak = calculateStreak(sessions);
  const weekDone = sessionsThisWeek(sessions);
  const currentReps = current?.type === "reps" ? Math.floor(exElapsed / (current.repCycle || 1.5)) : 0;
  const targetReps = current?.type === "reps" ? Math.floor(currentWeek.duration / (current.repCycle || 1.5)) : 0;
  const nextLabel = () => {
    if (screen === "rest") return EXS[0].name;
    if (exIndex < EXS.length - 1) return EXS[exIndex + 1].name;
    if (round < currentWeek.rounds) return "Repos";
    return "Fin";
  };

  // beep palette: 3 short low beeps (3-2-1) + 1 higher/longer beep at 0
  const COUNTDOWN_SECS = 3; // how many end-of-exercise beeps
  const TRANSITION_SECS = 3; // gap between exercises in auto mode
  const beepCount = (n: number) => beep(520, 0.09, settings.sound); // low countdown beep
  const beepGo = () => beep(900, 0.26, settings.sound);              // high/long transition beep

  // Motivational coach lines — varied so it never feels robotic.
  // pickCue rotates through the pool (deterministic-ish via round+exIndex) so two
  // consecutive cues are rarely identical.
  const HALF_CUES = ["On est à la moitié, lâche rien !", "Mi-parcours, accroche-toi !", "La moitié est faite, encore un effort !", "Pile au milieu, tu gères, continue !"];
  const FINAL_CUES = ["Dernière ligne droite, donne tout !", "Presque fini, lâche rien !", "Termine fort, tu y es !", "Les derniers comptent, accroche-toi !"];
  function pickCue(pool: string[]) { return pool[(round + exIndex) % pool.length]; }

  // one-shot voice cues per exercise (reset on each new exo); silent in the last 5s
  // (the last 5s belong to the countdown beeps). Cues are spread across the
  // exercise — quarter / half / final stretch — for "spatialité dans le temps".
  const cuesRef = React.useRef<{ q1?: boolean; half?: boolean; q3?: boolean; ten?: boolean }>({});
  const resetCues = () => { cuesRef.current = {}; };
  function maybeCue(prev: number) {
    if (!settings.voice || screen !== "workout" || prev <= 5) return;
    const dur = currentWeek.duration;
    const C = cuesRef.current;
    // Voix volontairement sobre : une seule relance en milieu d'exo (+ un
    // dernier rappel à 10 s sur les exos tenus). Le reste, ce sont les bips.
    if (current?.type === "reps") {
      const tgt = targetReps;
      const done = Math.floor((dur - prev) / (current.repCycle || 1.5));
      const remain = Math.max(0, tgt - done);
      if (!C.half && prev <= Math.ceil(dur / 2)) { C.half = true; speak(`${pickCue(HALF_CUES)} Plus que ${remain} répétitions.`, true); return; }
    } else {
      if (!C.half && prev <= Math.ceil(dur / 2)) { C.half = true; speak(`${pickCue(HALF_CUES)} Tiens la position.`, true); return; }
      if (!C.ten && dur >= 24 && prev <= 10) { C.ten = true; speak(`Plus que dix secondes. ${pickCue(FINAL_CUES)}`, true); return; }
    }
  }

  // Tick: only decrement the clock. Beeps/cues/advancing live in the effect below,
  // so we never mutate other state from inside a setTimeLeft updater (that race
  // was collapsing the rest + transition periods to a single frame).
  React.useEffect(() => {
    const ticking = screen === "workout" || screen === "rest" || (screen === "transition" && settings.autoAdvance);
    if (!ticking || paused) return;
    const tmr = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
      setElapsed((e) => e + 1);
      if (screen === "workout") setExElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(tmr);
  }, [screen, paused, settings.autoAdvance]);

  // React to the clock: countdown beeps (3-2-1), voice cues, and advancing at 0.
  const nextRef = React.useRef<() => void>(() => {});
  React.useEffect(() => {
    if (paused) return;
    if (screen === "workout" || screen === "rest") {
      if (timeLeft > 0 && timeLeft <= COUNTDOWN_SECS) { beepCount(timeLeft); vibrate(30, settings.vibration); }
      if (timeLeft > 0) maybeCue(timeLeft);
    }
    const canAdvance = screen === "workout" || screen === "rest" || (screen === "transition" && settings.autoAdvance);
    if (timeLeft === 0 && canAdvance) nextRef.current();
  }, [timeLeft, screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the screen awake during a session; re-acquire when the tab returns to foreground
  React.useEffect(() => {
    const active = screen === "workout" || screen === "rest" || screen === "transition";
    if (!active) { releaseWakeLock(); return; }
    requestWakeLock();
    const onVis = () => { if (document.visibilityState === "visible") requestWakeLock(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { document.removeEventListener("visibilitychange", onVis); releaseWakeLock(); };
  }, [screen]);

  // Spotify mini-player shown during a session (legal way to stream real hits).
  // The iframe stays mounted while the session is active so playback survives
  // screen changes; "collapse" just slides the panel off-screen.
  const sessionActive = screen === "workout" || screen === "rest" || screen === "transition";
  const [musicOpen, setMusicOpen] = React.useState(false);

  // Pick a fresh, non-repeating TikTok every time we land on a gainage (hold) exo.
  const [holdVideoId, setHoldVideoId] = React.useState("");
  React.useEffect(() => {
    if (settings.distraction !== false && screen === "workout" && current?.type === "time") {
      setHoldVideoId(nextTikTokId());
    }
  }, [screen, exIndex, round]); // eslint-disable-line react-hooks/exhaustive-deps
  // A clip finished before the gainage timer did → roll the next TikTok.
  const onHoldEnded = React.useCallback(() => { setHoldVideoId(nextTikTokId()); }, []);

  function startSession() {
    unlockAudio(); // must run inside this tap so audio/voice work for the whole session
    resetCues();
    setScreen("workout"); setRound(1); setExIndex(0); setTimeLeft(currentWeek.duration);
    setElapsed(0); setExElapsed(0); setPaused(false); setSessionStart(new Date().toISOString());
    beepGo(); vibrate(80, settings.vibration); speak(`Tour 1. ${EXS[0].name}`, settings.voice);
  }
  function handleNext() {
    if (screen === "workout") {
      // exercise finished
      beepGo(); vibrate([60, 30, 60], settings.vibration);
      if (exIndex < EXS.length - 1) {
        // 3s transition before the next exercise (auto-advances unless Manuel)
        setScreen("transition"); setTimeLeft(settings.autoAdvance ? TRANSITION_SECS : 0);
        speak(`Prochain. ${EXS[exIndex + 1].name}`, settings.voice);
      } else if (round < currentWeek.rounds) {
        setScreen("rest"); setTimeLeft(currentWeek.rest); speak("Repos", settings.voice);
      } else { finishSession(); }
    } else if (screen === "transition") {
      // start the queued exercise
      const n = exIndex + 1; resetCues();
      setExIndex(n); setExElapsed(0); setTimeLeft(currentWeek.duration); setScreen("workout");
      speak(`C'est parti. ${EXS[n].name}`, settings.voice);
    } else if (screen === "rest") {
      // rest finished → first exercise of the next round
      beepGo(); vibrate([60, 30, 60], settings.vibration);
      const nr = round + 1; resetCues();
      setRound(nr); setExIndex(0); setTimeLeft(currentWeek.duration); setExElapsed(0); setScreen("workout");
      speak(`Tour ${nr}. ${EXS[0].name}`, settings.voice);
    }
  }
  nextRef.current = handleNext;
  function finishSession() {
    const session: Session = { date: sessionStart || new Date().toISOString(), week, duration: elapsed, rounds: currentWeek.rounds, exercises: EXS.length * currentWeek.rounds, plan: activePlan ? activePlan.title : undefined };
    const updated = [...sessions, session]; setSessions(updated); storageSet("sessions", updated);
    if (sessionsThisWeek(updated) >= 5 && week < 4) { const nw = week + 1; setWeekState(nw); setSettings((s) => ({ ...s, currentWeek: nw })); }
    setScreen("done"); successChime(settings.sound); vibrate([100, 50, 100, 50, 200], settings.vibration); speak("Terminé. Bien joué.", settings.voice);
    celebrateWorkout(); reportWorkout(); // local congrats + tell the backend (skips today's reminder/relance)
  }
  function reset() { setScreen("home"); setRound(1); setExIndex(0); setPaused(false); window.speechSynthesis && window.speechSynthesis.cancel(); }
  function setSetting(k: keyof Settings, v: any) { setSettings((s) => ({ ...s, [k]: v })); }
  function setWeek(w: number) { setWeekState(w); setSettings((s) => ({ ...s, currentWeek: w })); }
  function resetHistory() { if (confirm("Effacer toutes les séances ? Cette action est irréversible.")) { setSessions([]); storageSet("sessions", []); } }
  function share() { alert("Carte de séance prête à partager (export image à brancher)."); }
  function adoptPlan(prof: Profile | null, plan: Plan) {
    if (prof) { setProfileState(prof); setProfile(prof); }
    const np = [...plans, plan]; setPlansState(np); setPlans(np);
    setActiveIdState(plan.id); setActivePlanId(plan.id);
    setWeekState(1); setSettings((s) => ({ ...s, currentWeek: 1 }));
    setScreen("home"); setShowCoach(false);
  }
  function switchPlan(id: string) { setActiveIdState(id); setActivePlanId(id); setWeekState(1); setSettings((s) => ({ ...s, currentWeek: 1 })); setScreen("home"); }

  const ctx: any = {
    P, illustration, ctaStyle, calStyle, prefs, setPref, SOFT: SOFT_SHADOW,
    screen, week, round, exIndex, current, currentWeek, timeLeft, paused, progress,
    totalSessionTime, streak, weekDone, currentReps, targetReps, nextLabel, settings, sessions, elapsed, holdVideoId, onHoldEnded,
    plan: activePlan, exs: EXS, profile, plans, freq: (profile && profile.frequency) || 4,
    go: (s: string) => { setScreen(s); window.speechSynthesis && window.speechSynthesis.cancel(); },
    startSession, handleNext, reset, togglePause: () => setPaused((p) => !p), setSetting, setWeek, resetHistory, share,
    openCoach: () => setShowCoach(true), switchPlan,
  };

  // On a real phone (or once installed as a PWA) drop the iPhone mock frame and
  // go edge-to-edge; keep the framed + scaled mock on larger screens.
  const isBare = () => typeof window !== "undefined" && (
    window.matchMedia("(max-width: 600px)").matches ||
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
  const [bare, setBare] = React.useState(isBare);
  const [scale, setScale] = React.useState(1);
  const [showSplash, setShowSplash] = React.useState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1900);
    return () => clearTimeout(t);
  }, []);
  React.useEffect(() => {
    const fit = () => {
      setBare(isBare());
      setScale(Math.min(window.innerWidth / 402, window.innerHeight / 874, 1.15));
    };
    fit();
    window.addEventListener("resize", fit);
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener?.("change", fit);
    return () => { window.removeEventListener("resize", fit); mq.removeEventListener?.("change", fit); };
  }, []);

  let Screen = HomeScreen;
  if (screen === "workout") Screen = WorkoutScreen;
  else if (screen === "transition") Screen = TransitionScreen;
  else if (screen === "rest") Screen = RestScreen;
  else if (screen === "done") Screen = DoneScreen;
  else if (screen === "history") Screen = HistoryScreen;
  else if (screen === "settings") Screen = SettingsScreen;
  else if (screen === "programs") Screen = ProgramsScreen;

  const navScreens = ["home", "programs", "history", "settings"];
  const showNav = !needOnboarding && loaded && navScreens.includes(screen);

  const inner = (
    <div style={{ position: "relative", height: "100%", fontFamily }}>
      <div className="vp-app" style={{ height: "100%", overflowY: "auto", overflowX: "hidden", background: P.bg, fontFamily }}>
        {!loaded ? (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: P.muted }}>
            <div style={{ width: 40, height: 40, borderRadius: 9999, border: `3px solid ${P.borderStrong}`, borderTopColor: P.actionDeep, animation: "vp-spin .8s linear infinite" }} />
          </div>
        ) : needOnboarding ? <OnboardingFlow P={P} onDone={adoptPlan} /> : <Screen {...ctx} />}
      </div>
      {sessionActive && settings.distraction !== false && (
        <>
          {!musicOpen && (
            <button onClick={() => setMusicOpen(true)} aria-label="Musique" style={{ position: "absolute", right: 16, bottom: 92, zIndex: 75, width: 46, height: 46, borderRadius: 9999, background: "#1DB954", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(29,185,84,0.45)", border: "none" }}>
              <Icon name="volume" size={20} />
            </button>
          )}
          {/* Panel stays mounted while the session is active → audio keeps playing when collapsed. */}
          <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, zIndex: 74, transform: musicOpen ? "translateY(0)" : "translateY(160%)", transition: "transform .32s cubic-bezier(.22,.61,.36,1)", background: P.surface, borderRadius: 22, border: `1px solid ${P.border}`, boxShadow: "0 18px 44px rgba(20,18,12,0.22)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px 6px" }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "-0.01em", color: P.ink }}>Musique · Top 50 France</span>
              <button onClick={() => setMusicOpen(false)} aria-label="Réduire" style={{ width: 30, height: 30, borderRadius: 9999, background: P.tint, color: P.ink, display: "flex", alignItems: "center", justifyContent: "center", border: "none" }}><Icon name="x" size={16} /></button>
            </div>
            <iframe title="Spotify" src={spotifyEmbed()} allow="autoplay; encrypted-media; clipboard-write; fullscreen; picture-in-picture" loading="lazy" style={{ width: "100%", height: 152, border: 0, display: "block" }} />
          </div>
        </>
      )}
      {showNav && <BottomNav P={P} active={screen} onNav={(id: string) => ctx.go(id)} onStart={startSession} />}
      {showCoach && <CoachSheet P={P} profile={profile} plans={plans} onClose={() => setShowCoach(false)} onCreate={(plan: Plan) => adoptPlan(null, plan)} />}
    </div>
  );

  // edge-to-edge on phone / installed PWA, framed iPhone mock on larger screens
  const app = bare ? (
    <div style={{ position: "fixed", inset: 0, width: "100%", height: "100dvh", background: P.bg, color: P.ink, fontFamily, overflow: "hidden" }}>
      {inner}
    </div>
  ) : (
    <div style={{ transform: `scale(${scale})`, transformOrigin: "center center", fontFamily }}>
      <IOSDevice width={402} height={874}>{inner}</IOSDevice>
    </div>
  );

  return (
    <>
      {app}
      <AnimatePresence>{showSplash && <Splash key="splash" P={P} />}</AnimatePresence>
    </>
  );
}

export default App;
