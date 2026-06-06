// POST { subscription, days:[], time:"HH:MM", tz } → store/update the reminder.
import { redis, SET_KEY, recKey, endpointId, readBody } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!redis) return res.status(503).json({ error: "store-not-configured" });
  try {
    const { subscription, days, time, tz } = await readBody(req);
    if (!subscription?.endpoint || !Array.isArray(days) || !time) {
      return res.status(400).json({ error: "bad-request" });
    }
    const id = endpointId(subscription.endpoint);
    const record = { subscription, days, time, tz: tz || "Europe/Paris", lastSent: "" };
    await redis.set(recKey(id), record);
    await redis.sadd(SET_KEY, id);
    return res.status(200).json({ ok: true, id });
  } catch (e) {
    return res.status(500).json({ error: "server", detail: String(e) });
  }
}
