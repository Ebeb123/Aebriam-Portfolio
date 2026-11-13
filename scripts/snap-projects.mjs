// Retakes the project card screenshots when a project repo gets a new commit.
// Runs every hour from .github/workflows/project-shots.yml, or by hand:
//   npm run shots                     only repos that changed since the last screenshot
//   npm run shots -- --force          every repo
//   npm run shots -- --only Budgee    one repo (implies --force)
//   node scripts/snap-projects.mjs --check   just say which repos changed (no browser)
//
// It screenshots each repo's Website link, saves public/projects/<slug>.jpg and records
// the commit time in src/content/project-shots.json (the cards read the image from there).
// Mobile apps are drawn inside a phone frame. Opt a repo out with "autoShot": false
// in its github.config.json override (e.g. to keep a hand-made image). Optional overrides:
// "shotUrl" (page to screenshot instead of the Website link), "shotBg" (phone background color).
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const cfg = JSON.parse(fs.readFileSync(new URL('../src/content/github.config.json', import.meta.url), 'utf8'));
const shotsPath = new URL('../src/content/project-shots.json', import.meta.url);
const shots = fs.existsSync(shotsPath) ? JSON.parse(fs.readFileSync(shotsPath, 'utf8')) : {};

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force') || !!only;
const checkOnly = args.includes('--check');
const SETTLE_MS = 10 * 60 * 1000; // give the demo's own deploy time to finish before screenshotting

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-shots' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const res = await fetch(`https://api.github.com/users/${encodeURIComponent(cfg.username)}/repos?per_page=100&sort=pushed`, { headers });
if (!res.ok) throw new Error(`GitHub ${res.status}`);
const topic = String(cfg.topic || 'portfolio').toLowerCase();

const isMobile = (r, o) => {
  if (o.kind) return o.kind === 'Mobile app';
  const t = (r.topics || []).map((x) => x.toLowerCase());
  const d = (r.description || '').toLowerCase();
  return t.includes('mobile-app') || t.includes('react-native') || d.includes('react native') || d.includes('expo');
};

const todo = (await res.json())
  .filter((r) => (r.topics || []).map((t) => t.toLowerCase()).includes(topic) && /^https?:\/\//.test(r.homepage || ''))
  .filter((r) => !only || r.name.toLowerCase() === only.toLowerCase())
  .map((r) => {
    const o = cfg.overrides?.[r.name] ?? {};
    const file = (o.image && o.image.startsWith('/projects/') ? o.image.split('?')[0] : `/projects/${o.slug || r.name.toLowerCase()}.jpg`);
    return { r, o, file, mobile: isMobile(r, o) };
  })
  .filter(({ o }) => o.autoShot !== false)
  .filter(({ r }) => force || (shots[r.name]?.pushedAt !== r.pushed_at && Date.now() - Date.parse(r.pushed_at) > SETTLE_MS));

console.log(todo.length ? `[shots] to update: ${todo.map((t) => t.r.name).join(', ')}` : '[shots] nothing changed');
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${todo.length > 0}\n`);
if (checkOnly || !todo.length) process.exit(0);

const { chromium } = await import('playwright');
const browser = await chromium.launch();

const settle = async (page, url) => {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  // Apps Script pages: hide Google's "created by a Google Apps Script user" bar above the app
  await page.evaluate(() => {
    document.querySelectorAll('#warning-bar-table tr').forEach((tr) => { if (!tr.querySelector('iframe')) tr.style.display = 'none'; });
  });
  await page.waitForTimeout(3000); // fonts, charts and Apps Script iframes
};

// Phone frame on a soft background, 1200x750 (same look as the hand-made ones).
const phoneHtml = (png, bg) => `<!doctype html><html><body style="margin:0;width:1200px;height:750px;overflow:hidden;
  background:radial-gradient(circle at 15% 0%, #fff8 0, transparent 60%), ${bg};font-size:0">
  <div style="position:absolute;left:365px;top:57px;width:446px;padding:12px;border-radius:52px;background:#111;
    box-shadow:0 30px 60px -20px #0004">
    <img src="data:image/png;base64,${png}" style="display:block;width:446px;border-radius:40px">
  </div></body></html>`;

for (const { r, o, file, mobile } of todo) {
  try {
    const out = fileURLToPath(new URL(`../public${file}`, import.meta.url));
    const url = o.shotUrl || r.homepage;
    if (mobile) {
      const phone = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'en-US' });
      const page = await phone.newPage();
      await settle(page, url);
      const png = (await page.screenshot()).toString('base64');
      await phone.close();
      const frame = await browser.newContext({ viewport: { width: 1200, height: 750 } });
      const fp = await frame.newPage();
      await fp.setContent(phoneHtml(png, o.shotBg || '#e9edf2'), { waitUntil: 'load' });
      await fp.screenshot({ path: out, type: 'jpeg', quality: 85 });
      await frame.close();
    } else {
      const ctx = await browser.newContext({ viewport: { width: 1200, height: 675 }, locale: 'en-US' });
      const page = await ctx.newPage();
      await settle(page, url);
      await page.screenshot({ path: out, type: 'jpeg', quality: 82 });
      await ctx.close();
    }
    // ?v= makes browsers fetch the new image instead of a cached old one
    shots[r.name] = { image: `${file}?v=${Date.parse(r.pushed_at).toString(36)}`, pushedAt: r.pushed_at };
    console.log(`[shots] ${r.name} → public${file}`);
  } catch (err) {
    console.warn(`[shots] ${r.name} failed: ${err.message}`);
  }
}

await browser.close();
fs.writeFileSync(shotsPath, JSON.stringify(shots, null, 2) + '\n');
