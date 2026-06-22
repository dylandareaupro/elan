/* Re-scrape les TikToks "drôles" du moment et POST la liste vers /api/tiktok.
   Lancé chaque semaine par .github/workflows/tiktok-refresh.yml (Playwright +
   Chromium sur un runner GitHub Actions). Échoue proprement si bloqué : le
   garde-fou côté API (< 10 IDs) protège la liste existante. */
import { chromium } from "playwright";

const POST_URL = process.env.TIKTOK_POST_URL || "https://ventre-plat.vercel.app/api/tiktok";
const SECRET = process.env.CRON_SECRET;
const TAGS = ["funny", "comedy", "fail", "humour"];
const TARGET = 150;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function collectFromTag(page, tag, all) {
  await page.goto(`https://www.tiktok.com/tag/${tag}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);
  for (let i = 0; i < 14 && all.size < TARGET; i++) {
    await page.mouse.wheel(0, 5000);
    await page.waitForTimeout(1500);
    const ids = await page.evaluate(() => {
      const s = new Set();
      document.querySelectorAll('a[href*="/video/"]').forEach((a) => {
        const m = a.href.match(/\/video\/(\d+)/);
        if (m) s.add(m[1]);
      });
      return [...s];
    });
    ids.forEach((id) => all.add(id));
  }
}

async function main() {
  if (!SECRET) throw new Error("CRON_SECRET manquant");
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, locale: "fr-FR", viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const all = new Set();
  for (const tag of TAGS) {
    if (all.size >= TARGET) break;
    try { await collectFromTag(page, tag, all); }
    catch (e) { console.error(`tag #${tag} échoué:`, e.message); }
    console.log(`après #${tag} : ${all.size} IDs`);
  }
  await browser.close();

  const ids = [...all].slice(0, TARGET);
  console.log(`scrapé ${ids.length} IDs`);
  if (ids.length < 10) { console.error("trop peu d'IDs (probablement bloqué), on abandonne sans écraser."); process.exit(1); }

  const r = await fetch(POST_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${SECRET}` },
    body: JSON.stringify({ ids }),
  });
  const txt = await r.text();
  console.log(`POST ${POST_URL} → ${r.status} ${txt}`);
  if (!r.ok) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
