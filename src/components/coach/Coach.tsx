/* ============================================================
   VENTRE PLAT — Coach: onboarding + local AI chat + plan generation
   Ported from coach.jsx. The AI call is replaced by the offline
   local coach (engine.localCoachTurn) with a simulated typing delay.
   ============================================================ */
import React from "react";
import { motion } from "framer-motion";
import { Icon } from "../Icon";
import { ExerciseFigure } from "../ExerciseFigure";
import { LogoMark } from "../Logo";
import {
  localCoachTurn, fallbackSuggestions, figureForName, photoForName,
  SUGGESTIONS, type Plan, type Profile, type Palette, type CoachMode, type CoachTurn,
} from "../../lib/engine";
import { Eyebrow, Pill, CTA, GhostBtn, CARD_SHADOW, SOFT_SHADOW } from "../ui";

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// async wrapper around the synchronous local coach to keep the chat UX (typing…)
async function callCoach(profile: Profile, turns: CoachTurn[], objective: string, opts: { mode?: CoachMode; basePlan?: Plan | null } = {}) {
  await delay(620 + Math.random() * 520);
  return localCoachTurn(profile, turns, objective, opts);
}

/* ---------- profile step ---------- */
function Field({ label, children, P }: any) {
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: P ? P.text2 : "#615C6E", marginBottom: 7 }}>{label}</div>
      {children}
    </div>
  );
}
function NumInput({ value, onChange, suffix, P, placeholder }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", background: P.surface, border: `1px solid ${P.border}`, borderRadius: 16, padding: "13px 15px" }}>
      <input type="number" inputMode="numeric" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 17, fontWeight: 700, color: P.ink, fontFamily: "inherit" }} />
      {suffix && <span style={{ fontSize: 14, fontWeight: 700, color: P.muted }}>{suffix}</span>}
    </div>
  );
}
function SegPick({ value, options, onChange, P }: any) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map((o: string) => {
        const on = o === value;
        return <button key={o} onClick={() => onChange(o)} style={{ flex: 1, padding: "12px 6px", borderRadius: 14, fontSize: 13.5, fontWeight: 700, background: on ? P.ink : P.surface, color: on ? P.bg : P.text2, border: `1px solid ${on ? P.ink : P.border}` }}>{o}</button>;
      })}
    </div>
  );
}

function ProfileStep({ P, profile, setField, onNext }: any) {
  const ok = profile.age && profile.height && profile.weight;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Eyebrow P={P}>Étape 1 / 2 · Toi</Eyebrow>
      <h1 style={{ margin: "10px 0 4px", fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em" }}>Faisons connaissance</h1>
      <p style={{ margin: 0, color: P.text2, fontSize: 14.5 }}>Pour calibrer ton programme au plus juste.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 22, flex: 1 }}>
        <Field label="Prénom (optionnel)" P={P}>
          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 16, padding: "13px 15px" }}>
            <input value={profile.name || ""} placeholder="Ton prénom" onChange={(e) => setField("name", e.target.value)} style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: 17, fontWeight: 700, color: P.ink, fontFamily: "inherit" }} />
          </div>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Field label="Âge" P={P}><NumInput value={profile.age || ""} onChange={(v: string) => setField("age", v)} suffix="ans" placeholder="29" P={P} /></Field>
          <Field label="Taille" P={P}><NumInput value={profile.height || ""} onChange={(v: string) => setField("height", v)} suffix="cm" placeholder="180" P={P} /></Field>
          <Field label="Poids" P={P}><NumInput value={profile.weight || ""} onChange={(v: string) => setField("weight", v)} suffix="kg" placeholder="68" P={P} /></Field>
        </div>
        <Field label="Sexe" P={P}><SegPick value={profile.sex} options={["Homme", "Femme", "Autre"]} onChange={(v: string) => setField("sex", v)} P={P} /></Field>
        <Field label="Niveau" P={P}><SegPick value={profile.level} options={["Débutant", "Intermédiaire", "Avancé"]} onChange={(v: string) => setField("level", v)} P={P} /></Field>
        <Field label={`Fréquence · ${profile.frequency || 4} séances / semaine`} P={P}>
          <input type="range" min="2" max="7" value={profile.frequency || 4} onChange={(e) => setField("frequency", Number(e.target.value))} style={{ width: "100%", accentColor: P.actionDeep }} />
        </Field>
      </div>

      <CTA P={P} ctaStyle="peach" icon="arrowR" onClick={onNext}>{ok ? "Continuer" : "Renseigne âge · taille · poids"}</CTA>
    </div>
  );
}

/* ---------- plan preview card ---------- */
export function PlanPreview({ plan, P, onAdopt, onRefine, compact }: { plan: Plan; P: Palette; onAdopt: (p: Plan) => void; onRefine: () => void; compact?: boolean }) {
  return (
    <div style={{ background: P.surface, borderRadius: 24, border: `1px solid ${P.border}`, boxShadow: CARD_SHADOW, overflow: "hidden" }}>
      <div style={{ background: P.info, padding: "18px 18px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -16, bottom: -14, width: 120, height: 110, opacity: 0.95 }}>{photoForName(plan.exercises[0].name) ? <img src={photoForName(plan.exercises[0].name)!} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "right bottom" }} /> : <ExerciseFigure id={figureForName(plan.exercises[0].name)} color={P.figure} />}</div>
        <Eyebrow P={P} color={P.onInfo} style={{ opacity: 0.7 }}>Programme proposé</Eyebrow>
        <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 5, maxWidth: 220 }}>{plan.title}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {plan.focusZones.slice(0, 3).map((z) => <Pill key={z} P={P} tone="surface" style={{ fontSize: 11.5, padding: "5px 11px" }}>{z}</Pill>)}
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
          <div><div className="mono" style={{ fontSize: 22, fontWeight: 800 }}>{plan.durationMin}<span style={{ fontSize: 13, color: P.muted }}> min</span></div><div style={{ fontSize: 11.5, color: P.text2, fontWeight: 600 }}>par séance</div></div>
          <div><div className="mono" style={{ fontSize: 22, fontWeight: 800 }}>{plan.exercises.length}</div><div style={{ fontSize: 11.5, color: P.text2, fontWeight: 600 }}>exercices</div></div>
          <div><div className="mono" style={{ fontSize: 22, fontWeight: 800 }}>4</div><div style={{ fontSize: 11.5, color: P.text2, fontWeight: 600 }}>semaines</div></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 4 }}>
          {plan.exercises.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: i ? `1px solid ${P.border}` : "none" }}>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: photoForName(e.name) ? "#fff" : P.tint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", border: photoForName(e.name) ? `1px solid ${P.border}` : "none" }}>{photoForName(e.name) ? <img src={photoForName(e.name)!} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div style={{ width: 26, height: 18 }}><ExerciseFigure id={figureForName(e.name)} color={P.figure} /></div>}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{e.name}</span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: P.muted }}>{e.type === "reps" ? "reps" : "tenu"}</span>
            </div>
          ))}
        </div>
        {!compact && <p style={{ fontSize: 13, color: P.text2, lineHeight: 1.5, margin: "10px 0 16px" }}>{plan.coachNote}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: compact ? 14 : 0 }}>
          <GhostBtn P={P} onClick={onRefine}>Affiner</GhostBtn>
          <div style={{ flex: 1 }}><CTA P={P} ctaStyle="peach" icon="check" onClick={() => onAdopt(plan)}>Adopter</CTA></div>
        </div>
      </div>
    </div>
  );
}

function CoachAvatar({ size = 32 }: { size?: number }) {
  return <img src="/assets/coach.png" alt="Coach" style={{ width: size, height: size, borderRadius: 9999, objectFit: "cover", objectPosition: "center top", flexShrink: 0, background: "#EDEAF6" }} />;
}

/* ---------- the chat ---------- */
function CoachChat({ P, profile, onAdopt, autofocusTitle, mode = "plan", plans = [], advicePrompts }: any) {
  const [turns, setTurns] = React.useState<CoachTurn[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [proposed, setProposed] = React.useState<Plan | null>(null);
  const [objective, setObjective] = React.useState("");
  const [picked, setPicked] = React.useState<string[]>([]);
  const [quick, setQuick] = React.useState<string[]>([]);
  const [basePlan, setBasePlan] = React.useState<Plan | null>(plans && plans.length ? plans[0] : null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const started = turns.length > 0;

  React.useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [turns, busy, proposed, quick]);

  function togglePick(s: string) { setPicked((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]); }

  async function send(text?: string) {
    const msg = (text != null ? text : input).trim();
    if (!msg || busy) return;
    if (!objective) setObjective(msg);
    const nextTurns: CoachTurn[] = [...turns, { role: "user", text: msg }];
    setTurns(nextTurns); setInput(""); setBusy(true); setProposed(null); setQuick([]);
    const res = await callCoach(profile, nextTurns, objective || msg, { mode, basePlan });
    setTurns((t) => [...t, { role: "coach", text: res.reply }]);
    setBusy(false);
    if (res.ready && res.plan) { setProposed(res.plan); setQuick([]); }
    else {
      const sg = (Array.isArray(res.suggestions) && res.suggestions.length ? res.suggestions : fallbackSuggestions(res.reply)).slice(0, 4);
      setQuick(sg);
    }
  }

  function submitInitial() {
    if (mode === "advice") { if (input.trim()) send(input.trim()); return; }
    const parts: string[] = [];
    if (mode === "modify" && basePlan) parts.push(`Pars de mon programme "${basePlan.title}"`);
    if (picked.length) parts.push(picked.join(" + "));
    if (input.trim()) parts.push(input.trim());
    const msg = parts.join(". ");
    if (msg) send(msg);
  }

  const canSubmit = mode === "advice" ? input.trim().length > 0 : (picked.length > 0 || input.trim().length > 0 || (mode === "modify" && !!basePlan));
  const cfg = ({
    plan: { title: profile.name && autofocusTitle ? `${profile.name}, on travaille quoi ?` : "On travaille quoi ?", sub: "Choisis une ou plusieurs zones, et précise avec tes mots.", ph: "Ex : j'ai une petite brioche, je veux renforcer ma ceinture abdominale.", cta: "Créer mon programme", icon: "boltF" },
    modify: { title: "On ajuste quoi ?", sub: "Choisis un programme à faire évoluer, puis dis ce qu'on change.", ph: "Ex : rends-le plus dur, ajoute des obliques, raccourcis à 10 min.", cta: "Modifier le programme", icon: "edit" },
    advice: { title: "Demande à ton coach", sub: "Nutrition, technique, récup, motivation — pose ta question.", ph: "Ex : qu'est-ce que je mange après une séance pour sécher ?", cta: "Demander conseil", icon: "boltF" },
  } as Record<string, any>)[mode];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {!started ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {autofocusTitle && <Eyebrow P={P}>Étape 2 / 2 · Ton objectif</Eyebrow>}
          <h1 className="vp-display" style={{ margin: autofocusTitle ? "10px 0 4px" : "0 0 4px", fontSize: 28, lineHeight: 0.98 }}>{cfg.title}</h1>
          <p style={{ margin: "0 0 18px", color: P.text2, fontSize: 14.5 }}>{cfg.sub}</p>

          {mode === "modify" && plans.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Eyebrow P={P} style={{ marginBottom: 10 }}>Programme à modifier</Eyebrow>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                {plans.map((pl: Plan) => {
                  const on = basePlan && pl.id === basePlan.id;
                  return (
                    <button key={pl.id} onClick={() => setBasePlan(pl)} style={{ flexShrink: 0, textAlign: "left", padding: "11px 14px", borderRadius: 16, background: on ? P.primary : P.surface, color: on ? "#fff" : P.ink, border: `1.5px solid ${on ? "transparent" : P.border}`, boxShadow: SOFT_SHADOW, maxWidth: 180 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pl.title}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: on ? "rgba(255,255,255,0.6)" : P.muted }}>{pl.exercises.length} exos · {pl.durationMin} min</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 20, padding: "16px 16px", boxShadow: CARD_SHADOW }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={3} placeholder={cfg.ph}
              style={{ width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", fontSize: 15.5, fontWeight: 500, color: P.ink, fontFamily: "inherit", lineHeight: 1.5 }} />
          </div>

          {mode !== "advice" && (
            <div style={{ marginTop: 16 }}>
              <Eyebrow P={P} style={{ marginBottom: 10 }}>{mode === "modify" ? "Ajouter une zone (option)" : "Zones — combine-les"}</Eyebrow>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SUGGESTIONS.map((s) => {
                  const on = picked.includes(s);
                  return (
                    <button key={s} onClick={() => togglePick(s)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: on ? "9px 13px 9px 11px" : "9px 15px", borderRadius: 9999, fontSize: 13.5, fontWeight: 700, background: on ? P.primary : P.surface, color: on ? "#fff" : P.ink, border: `1px solid ${on ? "transparent" : P.border}`, boxShadow: SOFT_SHADOW, transition: "background .15s" }}>
                      {on && <Icon name="check" size={14} color="#fff" stroke={3} />}
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {mode === "advice" && (
            <div style={{ marginTop: 16 }}>
              <Eyebrow P={P} style={{ marginBottom: 10 }}>Questions fréquentes</Eyebrow>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(advicePrompts || ["Quoi manger pour sécher ?", "Combien de séances par semaine ?", "Comment rester régulier ?", "J'ai mal au dos, je fais quoi ?"]).map((s: string) => (
                  <button key={s} onClick={() => send(s)} style={{ padding: "9px 14px", borderRadius: 9999, fontSize: 13.5, fontWeight: 700, background: P.accentSoft, color: P.accentDeep, border: `1px solid ${P.accent}33` }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {mode !== "advice" && picked.length > 0 && (
            <div style={{ marginTop: 14, padding: "12px 14px", background: P.primarySoft, borderRadius: 16, fontSize: 13.5, fontWeight: 600, color: P.primaryDeep }}>
              {mode === "modify" ? "Programme + zones : " : "Programme combiné : "}<strong style={{ fontWeight: 800 }}>{[mode === "modify" && basePlan ? basePlan.title : null, ...picked].filter(Boolean).join(" + ")}</strong>
            </div>
          )}
          <div style={{ flex: 1, minHeight: 14 }} />
          <button onClick={submitInitial} disabled={!canSubmit} style={{ marginTop: 16, width: "100%", padding: "17px", borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, fontSize: 16, fontWeight: 800, background: canSubmit ? P.primaryDeep : P.tint, color: canSubmit ? "#fff" : P.muted, boxShadow: canSubmit ? `0 8px 20px ${P.primaryDeep}50` : "none", transition: "background .2s" }}>
            <Icon name={cfg.icon} size={19} /> {cfg.cta}
          </button>
        </div>
      ) : (
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
            {turns.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "coach" && <div style={{ marginRight: 9, flexShrink: 0 }}><CoachAvatar size={32} /></div>}
                <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: 18, fontSize: 14.5, fontWeight: 500, lineHeight: 1.45, background: m.role === "user" ? P.ink : P.surface, color: m.role === "user" ? P.bg : P.ink, border: m.role === "user" ? "none" : `1px solid ${P.border}`, borderBottomRightRadius: m.role === "user" ? 5 : 18, borderBottomLeftRadius: m.role === "coach" ? 5 : 18 }}>{m.text}</div>
              </div>
            ))}
            {busy && <div style={{ display: "flex", alignItems: "center", gap: 9 }}><CoachAvatar size={32} /><div style={{ padding: "12px 16px", borderRadius: 18, background: P.surface, border: `1px solid ${P.border}` }}><span className="vp-typing" style={{ color: P.muted, fontWeight: 700, letterSpacing: 2 }}>···</span></div></div>}
            {proposed && <div style={{ marginTop: 4 }}><PlanPreview plan={proposed} P={P} onAdopt={onAdopt} onRefine={() => setProposed(null)} compact /></div>}
          </div>
          {!proposed && (
            <div style={{ paddingTop: 8 }}>
              {quick.length > 0 && !busy && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {quick.map((s) => (
                    <button key={s} onClick={() => send(s)} style={{ padding: "9px 14px", borderRadius: 9999, fontSize: 13.5, fontWeight: 700, background: P.primarySoft, color: P.primaryDeep, border: `1px solid ${P.primary}33` }}>{s}</button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1, background: P.surface, border: `1px solid ${P.border}`, borderRadius: 9999, padding: "5px 6px 5px 16px", display: "flex", alignItems: "center" }}>
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Réponds au coach…" style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 15, fontWeight: 500, color: P.ink, fontFamily: "inherit" }} />
                  <button onClick={() => send()} disabled={!input.trim() || busy} style={{ width: 40, height: 40, borderRadius: 9999, background: input.trim() && !busy ? P.actionDeep : P.tint, color: input.trim() && !busy ? "#fff" : P.muted, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon name="arrowR" size={18} /></button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- intro / splash ---------- */
function WelcomeScreen({ P, onStart }: { P: Palette; onStart: () => void }) {
  const features = [
    { icon: "boltF", text: "Un programme généré pour ton objectif" },
    { icon: "clock", text: "Séances courtes, guidées au timer" },
    { icon: "chart", text: "Ta progression, jour après jour" },
  ];
  const ease = [0.22, 0.61, 0.36, 1] as const;
  return (
    <div style={{
      position: "relative", minHeight: "100%", height: "100%", color: P.ink,
      background: `radial-gradient(120% 80% at 50% -8%, ${P.primarySoft} 0%, ${P.bg} 52%, ${P.bg} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "calc(72px + env(safe-area-inset-top, 0px)) 28px calc(30px + env(safe-area-inset-bottom, 0px))",
      textAlign: "center", overflow: "hidden",
    }}>
      {/* soft brand orb */}
      <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 360, height: 360, borderRadius: 9999, background: `radial-gradient(circle, ${P.primary}33, transparent 68%)`, pointerEvents: "none" }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, position: "relative" }}>
        <motion.div initial={{ scale: 0.7, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: 0.55, ease }}>
          <LogoMark P={P} size={104} radius={30} />
        </motion.div>
        <motion.h1 className="vp-display" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.16 }}
          style={{ margin: "26px 0 0", fontSize: 56, lineHeight: 0.96, letterSpacing: "-0.03em" }}>Élan</motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.26 }}
          style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600, color: P.text2, maxWidth: 280, lineHeight: 1.5 }}>
          Ton coach personnel. Décris ton objectif, l'app crée le programme qui te ressemble.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.38 }}
          style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 30, width: "100%", maxWidth: 320 }}>
          {features.map((f) => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: P.surface, borderRadius: 18, border: `1px solid ${P.border}`, boxShadow: SOFT_SHADOW, textAlign: "left" }}>
              <span style={{ width: 34, height: 34, borderRadius: 9999, flexShrink: 0, background: P.primarySoft, color: P.primaryDeep, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={f.icon} size={17} /></span>
              <span style={{ fontSize: 14, fontWeight: 600, color: P.ink }}>{f.text}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.5 }} style={{ width: "100%", maxWidth: 360 }}>
        <CTA P={P} ctaStyle="peach" icon="arrowR" onClick={onStart}>Commencer</CTA>
        <p style={{ margin: "14px 0 0", fontSize: 12.5, fontWeight: 600, color: P.muted }}>Sans compte · 100&nbsp;% sur ton téléphone</p>
      </motion.div>
    </div>
  );
}

/* ---------- onboarding flow (intro → profile → chat) ---------- */
export function OnboardingFlow({ P, onDone }: { P: Palette; onDone: (profile: Profile, plan: Plan) => void }) {
  const [step, setStep] = React.useState<"welcome" | "profile" | "chat">("welcome");
  const [profile, setProfile] = React.useState<Profile>({ age: "30", height: "180", weight: "70", sex: "Homme", level: "Intermédiaire", frequency: 4 });
  const setField = (k: string, v: any) => setProfile((p) => ({ ...p, [k]: v }));

  if (step === "welcome") return <WelcomeScreen P={P} onStart={() => setStep("profile")} />;

  return (
    <div style={{ minHeight: "100%", background: P.bg, color: P.ink, padding: "calc(58px + env(safe-area-inset-top, 0px)) 20px calc(26px + env(safe-area-inset-bottom, 0px))", display: "flex", flexDirection: "column" }}>
      {step === "profile" ? (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <button onClick={() => setStep("welcome")} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, color: P.text2, fontSize: 13.5, fontWeight: 700, marginBottom: 14 }}><Icon name="chevL" size={16} /> Intro</button>
          <ProfileStep P={P} profile={profile} setField={setField} onNext={() => { if (profile.age && profile.height && profile.weight) setStep("chat"); }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          <button onClick={() => setStep("profile")} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6, color: P.text2, fontSize: 13.5, fontWeight: 700, marginBottom: 14 }}><Icon name="chevL" size={16} /> Profil</button>
          <CoachChat P={P} profile={profile} autofocusTitle onAdopt={(plan: Plan) => onDone(profile, plan)} />
        </div>
      )}
    </div>
  );
}

/* ---------- coach sheet (reopened later: new plan / modify / advice) ---------- */
export function CoachSheet({ P, profile, onClose, onCreate, plans = [] }: { P: Palette; profile: Profile | null; onClose: () => void; onCreate: (p: Plan) => void; plans?: Plan[] }) {
  const [mode, setMode] = React.useState<CoachMode>("plan");
  const modes = [
    { id: "plan", label: "Nouveau", icon: "boltF" },
    { id: "modify", label: "Modifier", icon: "edit" },
    { id: "advice", label: "Conseils", icon: "drop" },
  ];
  const subFor = ({ plan: "Crée un nouveau programme", modify: "Fais évoluer un programme existant", advice: "Nutrition · technique · récup" } as Record<string, string>)[mode];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, background: P.bg, display: "flex", flexDirection: "column", padding: "58px 20px 26px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><CoachAvatar size={38} /><div><div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>Ton coach</div><div style={{ fontSize: 12, color: P.muted, fontWeight: 600 }}>{subFor}</div></div></div>
        <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 9999, background: P.surface, border: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: P.ink }}><Icon name="x" size={18} /></button>
      </div>

      <div style={{ display: "flex", gap: 6, background: P.tint, borderRadius: 9999, padding: 4, marginBottom: 16 }}>
        {modes.map((m) => {
          const on = m.id === mode;
          const disabled = m.id === "modify" && plans.length === 0;
          return (
            <button key={m.id} disabled={disabled} onClick={() => setMode(m.id as CoachMode)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 6px", borderRadius: 9999, fontSize: 13, fontWeight: 700, background: on ? P.surface : "transparent", color: disabled ? P.muted : on ? P.ink : P.text2, boxShadow: on ? SOFT_SHADOW : "none", opacity: disabled ? 0.5 : 1, transition: "background .2s" }}>
              <Icon name={m.icon} size={15} /> {m.label}
            </button>
          );
        })}
      </div>

      <CoachChat key={mode} P={P} profile={profile || {}} mode={mode} plans={plans} onAdopt={onCreate} />
    </div>
  );
}
