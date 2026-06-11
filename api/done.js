// POST { endpoint } → mark today (in the user's tz) as "trained", so the cron
// skips the reminder and the relance for that day. No-op if reminders are off.
import { redis, recKey, endpointId, readBody } from "./_lib.js";

function localYmd(tz) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!redis) return res.status(503).json({ error: "store-not-configured" });
  try {
    const { endpoint } = await readBody(req);
    if (!endpoint) return res.status(400).json({ error: "bad-request" });
    const rec = await redis.get(recKey(endpointId(endpoint)));
    if (!rec) return res.status(200).json({ ok: true, tracked: false }); // reminders not enabled
    rec.lastWorkout = localYmd(rec.tz || "Europe/Paris");
    await redis.set(recKey(endpointId(endpoint)), rec);
    return res.status(200).json({ ok: true, tracked: true });
  } catch (e) {
    return res.status(500).json({ error: "server", detail: String(e) });
  }
}
