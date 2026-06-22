/* ============================================================
   VENTRE PLAT — engine: data, palettes, helpers, plans, local coach
   Ported from the Claude Design prototype (core.jsx + coach.jsx logic).
   ============================================================ */

/* ---------- Types ---------- */
export interface Exercise {
  id?: string;
  name: string;
  type: "time" | "reps";
  repCycle?: number | null;
  info: string;
  zone: string;
}
export interface WeekSpec {
  week: number;
  label: string;
  duration: number;
  rest: number;
  rounds: number;
}
export interface Plan {
  id: string;
  title: string;
  goal: string;
  focusZones: string[];
  exercises: Exercise[];
  weeks: WeekSpec[];
  durationMin: number;
  coachNote: string;
  createdAt: string;
  source: string;
}
export interface Profile {
  name?: string;
  age?: string | number;
  height?: string | number;
  weight?: string | number;
  sex?: string;
  level?: string;
  frequency?: number;
}
export interface Session {
  date: string;
  week: number;
  duration: number;
  rounds: number;
  exercises: number;
  plan?: string;
}
export interface Settings {
  voice: boolean;
  vibration: boolean;
  sound: boolean;
  autoAdvance: boolean;
  distraction?: boolean; // TikTok pendant le gainage + musique pendant les reps
  currentWeek: number;
  reminderOn?: boolean;
  reminderDays?: string[]; // ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
  reminderTime?: string;   // "HH:MM"
}
export type Palette = Record<string, string>;

/* ---------- Programme data ---------- */
export const EXERCISES: Exercise[] = [
  { id: "plank", name: "Planche", type: "time", info: "Coudes au sol, gainage", zone: "Gainage profond" },
  { id: "crunch", name: "Crunchs", type: "reps", repCycle: 1.5, info: "Contracter sans tirer sur la nuque", zone: "Grand droit" },
  { id: "mountain", name: "Mountain Climbers", type: "reps", repCycle: 1.0, info: "Genoux alternés vers la poitrine", zone: "Cardio · abdos" },
  { id: "sideR", name: "Gainage Latéral D", type: "time", info: "Côté droit, corps aligné", zone: "Obliques" },
  { id: "sideL", name: "Gainage Latéral G", type: "time", info: "Côté gauche, corps aligné", zone: "Obliques" },
  { id: "legraise", name: "Leg Raises", type: "reps", repCycle: 2.0, info: "Contrôler la descente", zone: "Bas-ventre" },
  { id: "twist", name: "Russian Twists", type: "reps", repCycle: 1.0, info: "Une rotation L+R = 1 rep", zone: "Obliques" },
];

export const WEEKS: WeekSpec[] = [
  { week: 1, duration: 25, rest: 30, rounds: 3, label: "Initiation" },
  { week: 2, duration: 30, rest: 25, rounds: 3, label: "Régularité" },
  { week: 3, duration: 40, rest: 25, rounds: 3, label: "Intensité" },
  { week: 4, duration: 45, rest: 20, rounds: 3, label: "Performance" },
];

export const DEFAULT_SETTINGS: Settings = { voice: true, vibration: true, sound: true, autoAdvance: true, distraction: true, currentWeek: 1, reminderOn: false, reminderDays: ["Mon", "Wed", "Fri"], reminderTime: "18:00" };

/* ---------- Divertissement pendant la séance ----------
   Pendant les exos de gainage (type "time"), on affiche une vidéo TikTok ;
   pendant les exos en répétitions, une musique de fond (public/music/seance.mp3).

   👉 Colle ici tes vidéos TikTok : l'URL complète OU juste l'ID (les chiffres
   après /video/). Liste vide = on garde l'illustration normale. */
export const TIKTOK_HOLD_VIDEOS: string[] = [
  // "https://www.tiktok.com/@compte/video/7301234567890123456",
];
export function tiktokId(v: string): string {
  const m = v.match(/video\/(\d+)/);
  return (m ? m[1] : v).replace(/\D/g, "");
}
export const tiktokIds = () => TIKTOK_HOLD_VIDEOS.map(tiktokId).filter(Boolean);

/* Musique pendant la séance : embed officiel Spotify (seul moyen légal de
   diffuser de vrais tubes). Par défaut la playlist officielle "Top 50 - France"
   (MAJ chaque semaine). Pour en mettre une autre, colle juste l'ID de playlist
   (la partie après /playlist/ dans l'URL Spotify).
   Note : extraits de 30 s sur un compte gratuit, titres complets en Premium. */
export const SPOTIFY_PLAYLIST_ID = "37i9dQZEVXbIPWwFssbupI"; // Top 50 - France
export const spotifyEmbed = (id = SPOTIFY_PLAYLIST_ID) =>
  `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;

/* ---------- Palettes ---------- */
export const PALETTES: Record<string, Palette> = {
  Clair: {
    bg: "#F2F1F6", stage: "#DCDAE4", surface: "#FFFFFF", surfaceAlt: "#F7F6FB", tint: "#EEEDF4",
    primary: "#6E5CE6", primarySoft: "#E8E4FB", primaryDeep: "#5A45DC", onPrimary: "#FFFFFF",
    accent: "#32CBB0", accentSoft: "#D4F3EC", accentDeep: "#1BAE95", onAccent: "#06302A",
    action: "#F58341", actionSoft: "#FCE2D2", actionDeep: "#EE6A22", onAction: "#4A1E0D",
    success: "#BFE39A", successSoft: "#E7F2D5", successDeep: "#4F9D33", onSuccess: "#26400F",
    info: "#A9CDF4", infoSoft: "#DEEAF8", infoDeep: "#3B82D6", onInfo: "#12294A",
    lime: "#A8D84A", blue: "#4F8FE0", orange: "#F58341", coral: "#EE6A5A",
    ink: "#16141C", text2: "#615C6E", muted: "#A29CB0",
    border: "rgba(20,16,30,0.07)", borderStrong: "rgba(20,16,30,0.12)",
    figure: "#16141C", darkCard: "#181620",
  },
  Crème: {
    bg: "#F4F1EA", stage: "#E6E1D6", surface: "#FFFFFF", surfaceAlt: "#F0ECE3", tint: "#EEEAE1",
    primary: "#6E5CE6", primarySoft: "#E9E3F6", primaryDeep: "#5A45DC", onPrimary: "#FFFFFF",
    accent: "#2FBFA0", accentSoft: "#D8EFE7", accentDeep: "#1F9E84", onAccent: "#06302A",
    action: "#F3A35C", actionSoft: "#F9E0D2", actionDeep: "#EC8438", onAction: "#4A220F",
    success: "#CFE3AC", successSoft: "#E7F0D2", successDeep: "#73A03C", onSuccess: "#33420F",
    info: "#C3DCE8", infoSoft: "#DEEDF3", infoDeep: "#5093B0", onInfo: "#123642",
    lime: "#A7C84F", blue: "#5AA0BD", orange: "#E9A45C", coral: "#E97A60",
    ink: "#171511", text2: "#6E695F", muted: "#A8A296",
    border: "rgba(20,15,5,0.06)", borderStrong: "rgba(20,15,5,0.11)",
    figure: "#171511", darkCard: "#191510",
  },
  Brume: {
    bg: "#EAEDEF", stage: "#D5DADD", surface: "#FFFFFF", surfaceAlt: "#EEF1F2", tint: "#EBEEF0",
    primary: "#5E6AD6", primarySoft: "#E1E4F6", primaryDeep: "#4A56C8", onPrimary: "#FFFFFF",
    accent: "#2FB6C4", accentSoft: "#D6EEF1", accentDeep: "#1F96A4", onAccent: "#062B30",
    action: "#EB9079", actionSoft: "#F6D7D1", actionDeep: "#E3705B", onAction: "#3E1814",
    success: "#BFE0CE", successSoft: "#DEF0E7", successDeep: "#3E9C73", onSuccess: "#103A2A",
    info: "#BBD6E8", infoSoft: "#DBEAF3", infoDeep: "#4E94C0", onInfo: "#0E3140",
    lime: "#7CC49B", blue: "#5AA8CC", orange: "#E59A6A", coral: "#E4796E",
    ink: "#101418", text2: "#5C6469", muted: "#9AA1A8",
    border: "rgba(10,16,22,0.06)", borderStrong: "rgba(10,16,22,0.11)",
    figure: "#101418", darkCard: "#13171B",
  },
};

// pastel role rotation for the 7 exercises
export const EX_TONE = ["primary", "accent", "action", "info", "success", "action", "primary"];

/* ---------- Storage (localStorage) ---------- */
export function storageGet<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem("vp_" + key); return r ? (JSON.parse(r) as T) : fallback; }
  catch { return fallback; }
}
export function storageSet(key: string, value: unknown) {
  try { localStorage.setItem("vp_" + key, JSON.stringify(value)); } catch { /* ignore */ }
}

export const todayKey = () => new Date().toISOString().split("T")[0];
export const dateKey = (d: Date) => d.toISOString().split("T")[0];

export function calculateStreak(sessions: Session[]) {
  const unique = [...new Set(sessions.map((s) => s.date.split("T")[0]))].sort().reverse();
  if (!unique.length) return 0;
  const today = todayKey();
  const y = new Date(); y.setDate(y.getDate() - 1);
  const yesterday = dateKey(y);
  if (unique[0] !== today && unique[0] !== yesterday) return 0;
  let streak = 1; let cursor = new Date(unique[0]);
  for (let i = 1; i < unique.length; i++) {
    const expected = new Date(cursor); expected.setDate(expected.getDate() - 1);
    if (unique[i] === dateKey(expected)) { streak++; cursor = expected; } else break;
  }
  return streak;
}

export function sessionsThisWeek(sessions: Session[]) {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setDate(now.getDate() - day); monday.setHours(0, 0, 0, 0);
  const days = new Set<string>();
  for (const s of sessions) { const d = new Date(s.date); if (d >= monday) days.add(s.date.split("T")[0]); }
  return days.size;
}

// minutes done per weekday (Mon..Sun) this week — for the activity chart
export function weekActivity(sessions: Session[]) {
  const now = new Date();
  const day = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setDate(now.getDate() - day); monday.setHours(0, 0, 0, 0);
  const mins = [0, 0, 0, 0, 0, 0, 0];
  for (const s of sessions) {
    const d = new Date(s.date);
    if (d >= monday) { const idx = (d.getDay() + 6) % 7; mins[idx] += Math.round((s.duration || 0) / 60); }
  }
  return mins;
}

export const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/* ---------- Voice / beep / vibrate ---------- */
// Known French FEMALE voices across Apple / Microsoft / Google, and male names to avoid.
const FR_FEMALE_HINTS = ["aurélie", "aurelie", "audrey", "amélie", "amelie", "marie", "julie", "léa", "lea", "chloé", "chloe", "virginie", "céline", "celine", "denise", "hortense", "eloise", "éloise", "vivienne", "brigitte", "coralie", "jacqueline", "josephine", "joséphine", "yvette", "charline"];
const FR_MALE_HINTS = ["thomas", "daniel", "nicolas", "henri", "claude", "alain", "paul", "mathieu", "jérôme", "jerome", "maurice", "yves", "guillaume"];

let _voice: SpeechSynthesisVoice | null = null;
let _voiceTried = false;
function pickFrenchFemaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  const fr = voices.filter((v) => /^fr/i.test(v.lang));
  if (!fr.length) return null;
  const isMale = (v: SpeechSynthesisVoice) => FR_MALE_HINTS.some((h) => v.name.toLowerCase().includes(h));
  const isFemale = (v: SpeechSynthesisVoice) => FR_FEMALE_HINTS.some((h) => v.name.toLowerCase().includes(h));
  // prefer a named female voice, ideally an "enhanced/premium" one
  const femaleEnhanced = fr.find((v) => isFemale(v) && /enhanced|premium|siri|natural/i.test(v.name));
  const female = fr.find((v) => isFemale(v));
  const notMale = fr.find((v) => !isMale(v));
  return femaleEnhanced || female || notMale || fr[0];
}
function ensureVoice() {
  if (_voice || _voiceTried) return;
  _voice = pickFrenchFemaleVoice();
  if (_voice) _voiceTried = true;
}
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  // voices load asynchronously on iOS/Chrome — recompute when they arrive
  window.speechSynthesis.onvoiceschanged = () => { _voice = pickFrenchFemaleVoice(); };
  ensureVoice();
}

export function makeSpeak() {
  return (text: string, enabled: boolean) => {
    if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      ensureVoice();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "fr-FR";
      if (_voice) u.voice = _voice;
      u.rate = 1.0; u.pitch = 1.06; // slightly softer/warmer than default
      window.speechSynthesis.speak(u);
    } catch { /* ignore */ }
  };
}
export function vibrate(pattern: number | number[], enabled: boolean) {
  if (enabled && typeof navigator !== "undefined" && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch { /* ignore */ }
  }
}
let _audioCtx: AudioContext | null = null;
export function beep(freq: number, dur: number, enabled: boolean) {
  if (!enabled) return;
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = _audioCtx;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = freq; osc.type = "sine";
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch { /* ignore */ }
}

/* A short, satisfying ascending arpeggio + shimmer chord — played when a
   whole session is finished (the "Terminé" screen). Synthesised so it needs
   no audio asset and works offline. */
export function successChime(enabled: boolean) {
  if (!enabled) return;
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = _audioCtx;
    if (ctx.state === "suspended") ctx.resume();
    const note = (f: number, t0: number, peak: number, len: number, type: OscillatorType) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type; osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(peak, t0 + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + len);
      osc.start(t0); osc.stop(t0 + len + 0.05);
    };
    const t = ctx.currentTime;
    const arp = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    arp.forEach((f, i) => note(f, t + i * 0.12, 0.18, 0.5, "triangle"));
    const t1 = t + arp.length * 0.12;
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => note(f, t1, 0.11, 1.1, "sine")); // resolving chord
  } catch { /* ignore */ }
}

/* ---------- Audio unlock (must run inside a user gesture, e.g. "Démarrer") ----------
   iOS only allows audio + speechSynthesis after a tap. We create/resume the
   AudioContext and prime the speech engine so beeps & voice fire reliably later. */
export function unlockAudio() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(" ");
      u.volume = 0; window.speechSynthesis.speak(u);
    }
  } catch { /* ignore */ }
}

/* ---------- Wake Lock (keep the screen awake during a session) ----------
   On iOS the timer + audio die when the screen locks. Hold a screen wake lock
   for the duration of the workout and re-acquire it when the tab becomes visible. */
let _wakeLock: any = null;
export async function requestWakeLock() {
  try {
    if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
      _wakeLock = await (navigator as any).wakeLock.request("screen");
    }
  } catch { /* ignore (denied or unsupported) */ }
}
export function releaseWakeLock() {
  try { _wakeLock?.release?.(); } catch { /* ignore */ }
  _wakeLock = null;
}

/* ============================================================
   COACH ENGINE — exercise library, plans, fallback generator
   ============================================================ */
export const KNOWN_FIGS = ["plank", "crunch", "mountain", "sideR", "sideL", "legraise", "twist", "cobra", "superman", "squat", "bridge", "pushup", "jumpingjack", "lunge"];

// official no-background exercise photos (matched by keyword, like figureForName)
export const EX_PHOTOS: Record<string, string> = {
  plank: "/assets/exercises/plank.png",
  sidePlank: "/assets/exercises/side-plank.png",
  crunch: "/assets/exercises/crunch.png",
  bicycle: "/assets/exercises/bicycle-crunch.png",
  mountain: "/assets/exercises/mountain-climber.png",
  deadbug: "/assets/exercises/dead-bug.png",
  burpees: "/assets/exercises/burpees.png",
};
export function photoForName(name = ""): string | null {
  const n = name.toLowerCase();
  if (/gainage lat|planche lat|lateral|latéral|side plank/.test(n)) return EX_PHOTOS.sidePlank;
  if (/dead.?bug/.test(n)) return EX_PHOTOS.deadbug;
  if (/bicycle|vélo|velo/.test(n)) return EX_PHOTOS.bicycle;
  if (/mountain|grimpeur|climber/.test(n)) return EX_PHOTOS.mountain;
  if (/burpee/.test(n)) return EX_PHOTOS.burpees;
  if (/crunch|relevé buste|releve buste|sit.?up|abdo/.test(n)) return EX_PHOTOS.crunch;
  if (/planche|plank|gainage|hollow/.test(n)) return EX_PHOTOS.plank;
  return null;
}

// stable slot id for an exercise photo (shared across all screens)
export function exSlug(name = "") {
  return "vp-ex-" + name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export function figureForName(name = ""): string {
  const n = name.toLowerCase();
  if (/gainage lat|planche lat|lateral|latéral|side (plank|stretch)|oblique (hold|crunch)/.test(n)) return "sideR";
  if (/cobra/.test(n)) return "cobra";
  if (/superman|bird.?dog|y-t-w|extension dorsale/.test(n)) return "superman";
  if (/pont|bridge|hip thrust|fessier/.test(n)) return "bridge";
  if (/pompe|push.?up|dips/.test(n)) return "pushup";
  if (/squat|chaise|wall sit/.test(n)) return "squat";
  if (/fente|lunge|split/.test(n)) return "lunge";
  if (/jumping|jack|montée de genou|talon.?fesse|saut|burpee/.test(n)) return "jumpingjack";
  if (/planche|plank|hollow|dead.?bug|gainage/.test(n)) return "plank";
  if (/bicycle|vélo|relevé buste|crunch|ciseau|sit.?up/.test(n)) return "crunch";
  if (/mountain|grimpeur|climber/.test(n)) return "mountain";
  if (/leg raise|relevé de jambe|jambe tendue|relevé|legraise/.test(n)) return "legraise";
  if (/twist|russe|russian|rotation/.test(n)) return "twist";
  return "generic";
}

const E = (name: string, type: "time" | "reps", repCycle: number | null, info: string, zone: string): Exercise => ({ name, type, repCycle, info, zone });
export const LIB: Record<string, Exercise[]> = {
  Abdos: [
    E("Planche", "time", null, "Coudes au sol, corps gainé", "Gainage"),
    E("Crunchs", "reps", 1.5, "Contracter sans tirer sur la nuque", "Grand droit"),
    E("Mountain Climbers", "reps", 1.0, "Genoux alternés vers la poitrine", "Cardio · abdos"),
    E("Gainage Latéral D", "time", null, "Côté droit, corps aligné", "Obliques"),
    E("Gainage Latéral G", "time", null, "Côté gauche, corps aligné", "Obliques"),
    E("Leg Raises", "reps", 2.0, "Contrôler la descente", "Bas-ventre"),
    E("Russian Twists", "reps", 1.0, "Une rotation L+R = 1 rep", "Obliques"),
    E("Hollow Hold", "time", null, "Bas du dos plaqué au sol", "Gainage profond"),
    E("Bicycle Crunch", "reps", 1.0, "Coude vers genou opposé", "Obliques"),
  ],
  Fessiers: [
    E("Squats", "reps", 2.0, "Poids dans les talons", "Fessiers · cuisses"),
    E("Fentes alternées", "reps", 2.0, "Genou au-dessus de la cheville", "Fessiers"),
    E("Pont fessier", "time", null, "Pousse sur les talons, serre les fessiers", "Fessiers"),
    E("Donkey Kicks", "reps", 1.5, "Talon vers le plafond", "Fessiers"),
    E("Hip Thrust", "reps", 2.0, "Bassin haut, pause en haut", "Fessiers"),
    E("Fire Hydrants", "reps", 1.5, "Genou plié sur le côté", "Moyen fessier"),
  ],
  Dos: [
    E("Superman", "time", null, "Bras et jambes décollés", "Lombaires"),
    E("Bird-Dog", "reps", 2.0, "Bras et jambe opposés tendus", "Dos · gainage"),
    E("Y-T-W", "reps", 2.5, "Omoplates serrées", "Haut du dos"),
    E("Pont dorsal", "time", null, "Ouvre la cage thoracique", "Dos · posture"),
    E("Cobra", "time", null, "Buste levé, épaules basses", "Lombaires"),
  ],
  Jambes: [
    E("Squats", "reps", 2.0, "Descends sous la parallèle", "Cuisses"),
    E("Fentes", "reps", 2.0, "Buste droit", "Cuisses · fessiers"),
    E("Chaise murale", "time", null, "Dos plaqué, cuisses parallèles", "Quadriceps"),
    E("Mollets debout", "reps", 1.0, "Monte sur la pointe des pieds", "Mollets"),
    E("Squat sauté", "reps", 1.5, "Réception souple", "Explosivité"),
  ],
  Cardio: [
    E("Jumping Jacks", "reps", 0.5, "Rythme régulier", "Cardio"),
    E("Mountain Climbers", "reps", 0.6, "Gainage + rythme", "Cardio · abdos"),
    E("Montées de genoux", "reps", 0.5, "Genoux hauts", "Cardio"),
    E("Talons-fesses", "reps", 0.5, "Talons vers les fessiers", "Cardio"),
    E("Burpees", "reps", 3.0, "Enchaîne sans pause", "Full body"),
  ],
  "Full body": [
    E("Burpees", "reps", 3.0, "Enchaîne sans pause", "Full body"),
    E("Squats", "reps", 2.0, "Poids dans les talons", "Bas du corps"),
    E("Planche", "time", null, "Corps gainé", "Tronc"),
    E("Pompes", "reps", 2.0, "Coudes près du corps", "Haut du corps"),
    E("Fentes", "reps", 2.0, "Alternées", "Jambes"),
    E("Mountain Climbers", "reps", 0.8, "Cardio + gainage", "Tronc"),
  ],
  Mobilité: [
    E("Cat-Cow", "reps", 3.0, "Synchronise avec la respiration", "Colonne"),
    E("Rotation des hanches", "reps", 3.0, "Cercles lents", "Hanches"),
    E("World's Greatest", "reps", 4.0, "Étirement dynamique complet", "Full body"),
    E("Étirement chaîne post.", "time", null, "Respire dans l'étirement", "Ischios · dos"),
    E("Cercles d'épaules", "reps", 2.0, "Amplitude maximale", "Épaules"),
  ],
};

export function zonesFromText(text = ""): string[] {
  const n = text.toLowerCase(); const z: string[] = [];
  if (/ventre|abdo|abdomin|gainage|brioche|taille|sangle|six.?pack|tablette|core/.test(n)) z.push("Abdos");
  if (/fessier|glute|booty|fesse/.test(n)) z.push("Fessiers");
  if (/dos|posture|lombaire|back|cambr/.test(n)) z.push("Dos");
  if (/jambe|cuisse|quadri|mollet|leg/.test(n)) z.push("Jambes");
  if (/cardio|gras|maigr|perte|sèch|seche|brûl|brul|minc/.test(n)) z.push("Cardio");
  if (/full|complet|global|tout le corps|partout/.test(n)) z.push("Full body");
  if (/souplesse|mobilit|étire|etire|stretch|raideur/.test(n)) z.push("Mobilité");
  return z.length ? z : ["Abdos"];
}

const WEEK_LABELS = ["Initiation", "Régularité", "Intensité", "Performance"];
export function weeksForLevel(level?: string): WeekSpec[] {
  const ladder = ({
    "Débutant": [[20, 30], [25, 30], [30, 25], [35, 25]],
    "Intermédiaire": [[25, 30], [30, 25], [40, 25], [45, 20]],
    "Avancé": [[35, 25], [45, 20], [55, 20], [60, 15]],
  } as Record<string, number[][]>)[level || ""] || [[25, 30], [30, 25], [40, 25], [45, 20]];
  return ladder.map(([duration, rest], i) => ({ week: i + 1, label: WEEK_LABELS[i], duration, rest, rounds: 3 }));
}

let _planCounter = 0;
function planId() {
  _planCounter += 1;
  return "plan_" + Date.now() + "_" + _planCounter + "_" + Math.floor((performance.now() % 1) * 1e6).toString(36);
}

export function buildFallbackPlan(objective: string, profile: Profile = {}): Plan {
  const zones = zonesFromText(objective);
  const pool: Exercise[] = [];
  zones.forEach((z) => (LIB[z] || []).forEach((e) => pool.push({ ...e })));
  const seen = new Set<string>(); const exercises: Exercise[] = [];
  for (const e of pool) { if (!seen.has(e.name)) { seen.add(e.name); exercises.push(e); } if (exercises.length >= 7) break; }
  while (exercises.length < 5) { const e = LIB.Abdos[exercises.length]; if (!e || seen.has(e.name)) break; seen.add(e.name); exercises.push({ ...e }); }
  const titleMap: Record<string, string> = { Abdos: "Ceinture abdominale", Fessiers: "Fessiers & galbe", Dos: "Dos & posture", Jambes: "Jambes toniques", Cardio: "Cardio brûle-gras", "Full body": "Full body express", "Mobilité": "Mobilité & souplesse" };
  const weeks = weeksForLevel(profile.level);
  const totalMin = Math.round((weeks[0].rounds * exercises.length * weeks[0].duration + (weeks[0].rounds - 1) * weeks[0].rest) / 60);
  return {
    id: planId(),
    title: zones.length > 1 ? `${titleMap[zones[0]]} +` : (titleMap[zones[0]] || "Mon programme"),
    goal: objective || "Programme personnalisé",
    focusZones: [...new Set(exercises.map((e) => e.zone))].slice(0, 4),
    exercises, weeks, durationMin: totalMin,
    coachNote: `Programme ${zones.join(" + ").toLowerCase()} sur 4 semaines progressives, calibré ${(profile.level || "intermédiaire").toLowerCase()}. On y va en douceur, la régularité fait tout.`,
    createdAt: new Date().toISOString(), source: "local",
  };
}

/* ============================================================
   LOCAL COACH — offline multi-turn conversation (no API)
   Asks 1–2 clarifying questions then builds a tailored plan.
   ============================================================ */
export type CoachMode = "plan" | "modify" | "advice";
export interface CoachTurn { role: "user" | "coach"; text: string }
export interface CoachResult {
  reply: string;
  suggestions: string[];
  ready: boolean;
  plan: Plan | null;
}

// zone-specific clarifying questions, asked on the first turn
function zoneQuestion(zones: string[]): { reply: string; suggestions: string[] } {
  if (zones.includes("Abdos")) {
    return { reply: "Top, on attaque la sangle abdo. Tu veux cibler quoi en priorité ?", suggestions: ["Bas du ventre", "Obliques", "Tout équilibré", "Abdos visibles"] };
  }
  if (zones.includes("Fessiers")) {
    return { reply: "Programme fessiers, j'adore. On vise plutôt le galbe ou la force ?", suggestions: ["Galbe & tonus", "Force", "Tout équilibré"] };
  }
  if (zones.includes("Dos")) {
    return { reply: "Dos & posture, excellent réflexe. C'est surtout pour soulager ou pour renforcer ?", suggestions: ["Soulager le dos", "Renforcer", "Meilleure posture"] };
  }
  if (zones.includes("Cardio")) {
    return { reply: "Objectif cardio / perte de gras. Tu préfères de l'intensité ou quelque chose de soutenable ?", suggestions: ["Intense", "Modéré", "Doux pour commencer"] };
  }
  if (zones.includes("Full body")) {
    return { reply: "Full body, parfait pour progresser partout. Combien de temps par séance, idéalement ?", suggestions: ["10 min", "15 min", "20 min"] };
  }
  return { reply: "Compris. Pour bien calibrer : tu pars de quel niveau ?", suggestions: ["Débutant", "Intermédiaire", "Avancé"] };
}

/**
 * One turn of the local coach. Mirrors the prototype's window.claude contract
 * but runs fully offline with a small scripted multi-turn flow.
 */
export function localCoachTurn(profile: Profile, turns: CoachTurn[], objective: string, opts: { mode?: CoachMode; basePlan?: Plan | null } = {}): CoachResult {
  const mode = opts.mode || "plan";
  const userTurns = turns.filter((t) => t.role === "user");
  const allUserText = userTurns.map((t) => t.text).join(". ");

  if (mode === "advice") {
    const last = userTurns[userTurns.length - 1];
    return {
      reply: adviceFallback(last ? last.text : ""),
      suggestions: ["Quoi manger après le sport ?", "Comment rester régulier ?", "Combien de temps pour des résultats ?"],
      ready: false,
      plan: null,
    };
  }

  const baseText = mode === "modify" && opts.basePlan ? `${opts.basePlan.focusZones.join(" ")} ${objective} ${allUserText}` : `${objective} ${allUserText}`;
  const zones = zonesFromText(baseText);

  // First user turn → ask one clarifying question
  if (userTurns.length <= 1) {
    const q = zoneQuestion(zones);
    return { reply: q.reply, suggestions: q.suggestions, ready: false, plan: null };
  }

  // Second user turn → one more quick question (constraints), unless they already gave enough
  if (userTurns.length === 2) {
    return {
      reply: "Reçu. Dernière chose : un point sensible à éviter, ou on y va à fond ?",
      suggestions: ["Aucune douleur", "Bas du dos fragile", "Genoux fragiles", "On y va à fond"],
      ready: false,
      plan: null,
    };
  }

  // Third turn onward → build the plan from everything gathered
  const plan = mode === "modify" && opts.basePlan
    ? buildModifiedPlan(opts.basePlan, baseText, profile)
    : buildFallbackPlan(baseText, profile);
  return { reply: plan.coachNote, suggestions: [], ready: true, plan };
}

function buildModifiedPlan(base: Plan, text: string, profile: Profile): Plan {
  // start from the base zones, add any new ones detected, regenerate
  const newZones = zonesFromText(text);
  const merged = [...new Set([...base.focusZones, ...newZones])];
  const objective = `${base.goal} ${merged.join(" ")} ${text}`;
  const plan = buildFallbackPlan(objective, profile);
  const harder = /dur|intense|fort|plus|avanc/.test(text.toLowerCase());
  if (harder) plan.weeks = plan.weeks.map((w) => ({ ...w, duration: Math.min(75, w.duration + 8), rest: Math.max(12, w.rest - 4) }));
  plan.title = base.title.replace(/ \+$/, "") + " · v2";
  plan.coachNote = `Nouvelle version de « ${base.title} » ${harder ? "plus exigeante" : "réajustée"}, en gardant ta base. ${plan.coachNote}`;
  return plan;
}

/* ---------- advice fallbacks (nutrition / technique / récup / motivation) ---------- */
const ADVICE_DEFAULT = "Bonne question. Vise la régularité avant l'intensité : 3 à 4 séances courtes par semaine battent une grosse séance isolée. Hydrate-toi, dors 7-8 h, et garde un déficit calorique léger si l'objectif est de sécher. Tu veux qu'on creuse un point précis ?";
export function adviceFallback(q = ""): string {
  const n = q.toLowerCase();
  if (/mang|nutri|aliment|prot|repas|calorie|sèch|seche|gras/.test(n)) return "Côté nutrition : priorise les protéines (1,6 g/kg/jour), des légumes à chaque repas, et limite les sucres rapides. Pour perdre du gras, vise un déficit léger (~300 kcal/jour) — pas plus, sinon tu perds du muscle. L'eau et le sommeil comptent autant que l'assiette.";
  if (/dors|sommeil|récup|recup|repos|courbatur/.test(n)) return "La récup, c'est là que les abdos se construisent. Vise 7-8 h de sommeil, étire-toi après chaque séance, et laisse 48 h à un muscle avant de le retravailler à fond. Les courbatures normales ne contre-indiquent pas une séance légère.";
  if (/technique|posture|comment fair|exécu|execu|mal au dos|douleur/.test(n)) return "Pour la technique : garde le bas du dos plaqué au sol sur les exos d'abdos, expire à l'effort, et ne tire jamais sur ta nuque. Si une douleur articulaire apparaît, arrête l'exercice. Pour une douleur persistante, consulte un pro.";
  if (/motiv|tenir|abandon|envie|discipl/.test(n)) return "La motivation suit l'action, pas l'inverse. Bloque un créneau fixe, commence par 5 minutes les jours sans envie, et appuie-toi sur ta série pour ne pas casser la chaîne. Les petits pas réguliers gagnent toujours.";
  return ADVICE_DEFAULT;
}

// local heuristic quick-replies when none are provided
export function fallbackSuggestions(question = ""): string[] {
  const q = question.toLowerCase();
  if (/fréquence|combien.*semaine|par semaine|séances/.test(q)) return ["3×/semaine", "4×/semaine", "5×/semaine"];
  if (/douleur|mal|blessure|contrainte/.test(q)) return ["Aucune douleur", "Bas du dos", "Genoux"];
  if (/niveau|débutant|expérience|forme/.test(q)) return ["Débutant", "Intermédiaire", "Avancé"];
  if (/matériel|équipement|haltère|tapis|maison|salle/.test(q)) return ["Sans matériel", "Tapis seulement", "Haltères"];
  if (/zone|cibl|partie|travailler|focus/.test(q)) return ["Abdos", "Bas du ventre", "Obliques", "Full body"];
  if (/durée|temps|minutes|combien de temps/.test(q)) return ["10 min", "15 min", "20 min"];
  if (/\?$/.test(question.trim())) return ["Oui", "Non", "Peu importe"];
  return [];
}

/* ---- profile + plans persistence ---- */
export const getProfile = (): Profile | null => storageGet<Profile | null>("profile", null);
export const setProfile = (p: Profile) => storageSet("profile", p);
export const getPlans = (): Plan[] => storageGet<Plan[]>("plans", []);
export const setPlans = (arr: Plan[]) => storageSet("plans", arr);
export const getActivePlanId = (): string | null => storageGet<string | null>("activePlan", null);
export const setActivePlanId = (id: string) => storageSet("activePlan", id);

export const SUGGESTIONS = ["Ventre plat", "Abdos visibles", "Dos & posture", "Fessiers", "Full body", "Perte de gras", "Souplesse"];
