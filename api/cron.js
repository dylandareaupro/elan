// Called by the GitHub Actions scheduler (every ~15 min). For each reminder,
// compute the user's local time and fire a push if a slot is due today and
// hasn't been sent yet. Protected by CRON_SECRET.
import { redis, SET_KEY, recKey, configurePush, webpush } from "./_lib.js";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const WINDOW = 30; // minutes after the target slot we still allow a send
  const ids = (await redis.smembers(SET_KEY)) || [];
  let sent = 0, removed = 0, checked = 0;

  for (const id of ids) {
    const rec = await redis.get(recKey(id));
    if (!rec) { await redis.srem(SET_KEY, id); continue; }
    checked++;
    const { weekday, minutes, ymd } = localNow(rec.tz || "Europe/Paris");
    if (!rec.days?.includes(weekday)) continue;
    const [h, m] = String(rec.time).split(":").map((n) => parseInt(n, 10));
    const target = (h || 0) * 60 + (m || 0);
    const due = minutes >= target && minutes < target + WINDOW;
    if (!due || rec.lastSent === ymd) continue;

    try {
      await webpush.sendNotification(
        rec.subscription,
        JSON.stringify({ title: "Élan — c'est l'heure 💪", body: "Ta séance t'attend. On garde l'élan !", url: "/" })
      );
      rec.lastSent = ymd;
      await redis.set(recKey(id), rec);
      sent++;
    } catch (e) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await redis.del(recKey(id));
        await redis.srem(SET_KEY, id);
        removed++;
      }
    }
  }
  return res.status(200).json({ ok: true, checked, sent, removed });
}
