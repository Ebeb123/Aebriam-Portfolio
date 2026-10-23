// Vercel serverless function: GET /api/github
// Returns your public repo count and when you last pushed code, for the
// "GitHub · 21 public repos · last commit 2 days ago" line on the portfolio.
// Cached by Vercel for 1 hour so the GitHub rate limit is never hit.
const USER = process.env.GITHUB_USER || 'ebeb123';

export default async function handler(req, res) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(USER)}`, { headers }),
      fetch(`https://api.github.com/users/${encodeURIComponent(USER)}/repos?sort=pushed&per_page=1`, { headers }),
    ]);
    if (!userRes.ok || !reposRes.ok) throw new Error(`GitHub responded ${userRes.status}/${reposRes.status}`);
    const user = await userRes.json();
    const [latest] = await reposRes.json();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({
      publicRepos: user.public_repos ?? 0,
      lastPushAt: (latest && latest.pushed_at) || null,
      profileUrl: user.html_url || `https://github.com/${USER}`,
    });
  } catch (err) {
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(502).json({ error: String((err && err.message) || err) });
  }
}
