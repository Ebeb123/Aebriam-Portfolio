// Runs before every build (npm run build / Vercel): saves your "portfolio" repos
// to src/content/github-snapshot.json so the cards appear instantly, even if a
// visitor's browser can't reach GitHub. If GitHub can't be reached, the build
// keeps the previous snapshot and continues.
import fs from 'node:fs';

const cfgPath = new URL('../src/content/github.config.json', import.meta.url);
const outPath = new URL('../src/content/github-snapshot.json', import.meta.url);
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const API = process.env.GITHUB_API_URL || 'https://api.github.com';
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-build' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const getJson = async (url) => {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
};

try {
  if (!cfg.username) throw new Error('no username in github.config.json');
  const list = await getJson(`${API}/users/${encodeURIComponent(cfg.username)}/repos?per_page=100&sort=pushed`);
  const topic = String(cfg.topic || 'portfolio').toLowerCase();
  const picked = list.filter((r) => (r.topics || []).map((t) => t.toLowerCase()).includes(topic));
  const repos = [];
  for (const r of picked) {
    let languages = [];
    try {
      const langs = await getJson(r.languages_url.replace('https://api.github.com', API));
      const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
      languages = Object.entries(langs)
        .sort((a, b) => b[1] - a[1])
        .map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 1000) / 10 }));
    } catch {
      if (r.language) languages = [{ name: r.language, pct: 100 }];
    }
    repos.push({
      name: r.name,
      description: r.description || '',
      htmlUrl: r.html_url,
      homepage: r.homepage || '',
      topics: (r.topics || []).filter((t) => t.toLowerCase() !== topic),
      stars: r.stargazers_count || 0,
      pushedAt: r.pushed_at || '',
      languages,
    });
  }
  fs.writeFileSync(outPath, JSON.stringify(repos, null, 2) + '\n');
  console.log(`[github] saved ${repos.length} repo(s) tagged "${topic}" for ${cfg.username}`);
} catch (err) {
  console.warn(`[github] could not refresh snapshot (${err.message}) — keeping the previous one`);
}
