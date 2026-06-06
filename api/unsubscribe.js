// POST { endpoint } → remove the reminder.
import { redis, SET_KEY, recKey, endpointId, readBody } from "./_lib.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!redis) return res.status(503).json({ error: "store-not-configured" });
  try {
    const { endpoint } = await readBody(req);
    if (!endpoint) return res.status(400).json({ error: "bad-request" });
    const id = endpointId(endpoint);
    await redis.del(recKey(id));
    await redis.srem(SET_KEY, id);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "server", detail: String(e) });
  }
}
