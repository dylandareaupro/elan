// GET  → { ids: [...] }  liste TikTok courante (lecture publique pour l'app)
// POST → { ids: [...] }  écrite par le cron GitHub Actions (Authorization: Bearer CRON_SECRET)
import { redis, readBody } from "./_lib.js";

const KEY = "elan:tiktok";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Pas de cache CDN : la liste doit refléter le KV dès qu'un scrape la met à
    // jour (sinon une réponse vide reste figée à l'edge). Lecture KV = négligeable.
    res.setHeader("Cache-Control", "no-store");
    if (!redis) return res.status(200).json({ ids: [] });
    try {
      const ids = (await redis.get(KEY)) || [];
      return res.status(200).json({ ids: Array.isArray(ids) ? ids : [] });
    } catch {
      return res.status(200).json({ ids: [] });
    }
  }

  if (req.method === "POST") {
    const auth = req.headers.authorization || "";
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (!redis) return res.status(503).json({ error: "store-not-configured" });
    try {
      const body = await readBody(req);
      const clean = Array.isArray(body?.ids)
        ? [...new Set(body.ids.map(String).filter((x) => /^\d{6,}$/.test(x)))].slice(0, 200)
        : [];
      // garde-fou : un scrape bloqué (peu d'IDs) ne doit pas écraser une bonne liste
      if (clean.length < 10) return res.status(400).json({ error: "too-few", got: clean.length });
      await redis.set(KEY, clean);
      return res.status(200).json({ ok: true, count: clean.length });
    } catch (e) {
      return res.status(500).json({ error: "server", detail: String(e) });
    }
  }

  return res.status(405).json({ error: "method" });
}
