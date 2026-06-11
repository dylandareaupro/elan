// Called by the GitHub Actions scheduler (every ~15 min). For each reminder,
// compute the user's local time and fire a push if a slot is due today and
// hasn't been sent yet. Sends a gentle "relance" a few hours later if no
// workout was logged that day. Protected by CRON_SECRET.
import { redis, SET_KEY, recKey, configurePush, webpush } from "./_lib.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Varied reminder messages so the notification never feels like background noise.
const REMINDERS = [
  { title: "Élan — c'est l'heure 💪", body: "Ta séance t'attend. On garde l'élan !" },
  { title: "On bouge ? 🔥", body: "Quelques minutes suffisent pour gagner ta journée." },
  { title: "Ta séance du jour 🏃", body: "Le plus dur, c'est de commencer. Lance-toi !" },
  { title: "C'est le moment 💥", body: "Le toi de demain te dira merci. On y va." },
  { title: "Rendez-vous avec toi-même 🎯", body: "Ta séance Élan t'attend, juste là." },
  { title: "Allez, on s'active ⚡", body: "Un peu d'effort maintenant, zéro regret après." },
];

// Softer "you haven't moved yet" nudges, sent a few hours after the planned slot.
const RELANCES = [
  { title: "Pas encore bougé ? 🙂", body: "Il est encore temps — même une courte séance compte." },
  { title: "Ta séance t'attend toujours ⏳", body: "Pas trop tard pour garder l'élan aujourd'hui." },
  { title: "On ne lâche rien 💪", body: "Une petite séance maintenant et la journée est gagnée." },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// returns { ymd: "2026-06-06", weekday: "Sat", minutes: 540 } in the given tz
function localNow(tz) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false,
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value || "";
  const hour = parseInt(get("hour"), 10) % 24;
  const minute = parseInt(get("minute"), 10);
  let wd = get("weekday");
  // normalize "Sat" etc.; fall back to numeric day if needed
  if (!DAYS.includes(wd)) wd = DAYS[new Date().getUTCDay()];
  return { ymd: `${get("year")}-${get("month")}-${get("day")}`, weekday: wd, minutes: hour * 60 + minute };
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers["authorization"] || "";
  if (secret && auth !== `Bearer ${secret}`) return res.status(401).json({ error: "unauthorized" });
  if (!redis) return res.status(503).json({ error: "store-not-configured" });
  configurePush();

  const WINDOW = 30; // minutes after a slot we still allow a send
  const RELANCE_AFTER = 180; // minutes after the planned slot for the gentle nudge
  const ids = (await redis.smembers(SET_KEY)) || [];
  let sent = 0, relanced = 0, removed = 0, checked = 0;

  // Send a payload to a subscription; prunes the record on a dead endpoint.
  async function deliver(id, rec, payload) {
    try {
      await webpush.sendNotification(rec.subscription, JSON.stringify(payload));
      return true;
    } catch (e) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await redis.del(recKey(id));
        await redis.srem(SET_KEY, id);
        removed++;
      }
      return false;
    }
  }

  for (const id of ids) {
    const rec = await redis.get(recKey(id));
    if (!rec) { await redis.srem(SET_KEY, id); continue; }
    checked++;
    const { weekday, minutes, ymd } = localNow(rec.tz || "Europe/Paris");
    if (!rec.days?.includes(weekday)) continue;
    // Already trained today → stay quiet: no reminder and no relance.
    if (rec.lastWorkout === ymd) continue;

    const [h, m] = String(rec.time).split(":").map((n) => parseInt(n, 10));
    const target = (h || 0) * 60 + (m || 0);

    // 1) Main reminder at the planned slot.
    const dueMain = minutes >= target && minutes < target + WINDOW;
    if (dueMain && rec.lastSent !== ymd) {
      const msg = pick(REMINDERS);
      if (await deliver(id, rec, { ...msg, url: "/" })) {
        rec.lastSent = ymd;
        await redis.set(recKey(id), rec);
        sent++;
      }
      continue;
    }

    // 2) Gentle relance a few hours later if still no workout logged (same day only).
    const relanceTarget = target + RELANCE_AFTER;
    const dueRelance = relanceTarget + WINDOW <= 1440 && minutes >= relanceTarget && minutes < relanceTarget + WINDOW;
    if (dueRelance && rec.lastRelance !== ymd) {
      const msg = pick(RELANCES);
      if (await deliver(id, rec, { ...msg, url: "/" })) {
        rec.lastRelance = ymd;
        await redis.set(recKey(id), rec);
        relanced++;
      }
    }
  }
  return res.status(200).json({ ok: true, checked, sent, relanced, removed });
}
