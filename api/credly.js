// Vercel serverless function: GET /api/credly
// Reads your public Credly badges and returns them in a small, clean list.
// Earn a new badge on Credly -> it appears on the portfolio automatically
// (Vercel caches the answer for up to 1 hour, so allow up to an hour).
//
// Change the username here (or set CREDLY_USER in Vercel) if your Credly URL changes:
// https://www.credly.com/users/aebriam-lawas
const USER = process.env.CREDLY_USER || 'aebriam-lawas';

export default async function handler(req, res) {
  try {
    const badges = [];
    for (let page = 1; page <= 5; page++) {
      const r = await fetch(`https://www.credly.com/users/${encodeURIComponent(USER)}/badges.json?page=${page}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'portfolio' },
      });
      if (!r.ok) throw new Error(`Credly responded ${r.status}`);
      const json = await r.json();
      for (const b of json.data || []) {
        if (b.public === false || (b.state && b.state !== 'accepted')) continue;
        const t = b.badge_template || {};
        const entities = (b.issuer && b.issuer.entities) || [];
        const primary = entities.find((e) => e.primary) || entities[0];
        const issuer =
          (primary && primary.entity && primary.entity.name) ||
          ((b.issuer && b.issuer.summary) || '').replace(/^issued by\s+/i, '') ||
          '';
        badges.push({
          id: b.id,
          title: t.name || 'Badge',
          issuer,
          image: b.image_url || t.image_url || '',
          url: `https://www.credly.com/badges/${b.id}/public_url`,
          issuedAt: b.issued_at || '',
        });
      }
      if (!json.metadata || !json.metadata.next_page_url) break;
    }
    badges.sort((a, b) => String(b.issuedAt).localeCompare(String(a.issuedAt)));
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ badges });
  } catch (err) {
    res.setHeader('Cache-Control', 's-maxage=300');
    res.status(502).json({ error: String((err && err.message) || err) });
  }
}
