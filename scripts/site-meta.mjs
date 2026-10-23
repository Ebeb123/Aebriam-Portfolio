// Reads the few values the link preview needs straight from siteContent.ts,
// so the preview image AND the page description always match your content.
// Used by scripts/make-og.mjs and vite.config.ts.
import fs from 'node:fs';

const text = (re, src, fallback = '') => (src.match(re)?.[1] ?? fallback).replace(/\\'/g, "'");

export function readSiteMeta() {
  const src = fs.readFileSync(new URL('../src/content/siteContent.ts', import.meta.url), 'utf8');
  const name = text(/\bname:\s*'([^']+)'/, src, 'My Portfolio');
  const status = text(/\bstatus:\s*'([^']+)'/, src);
  const role = text(/\broles:\s*\[\s*'([^']+)'/, src); // the FIRST role, e.g. "BS Information Technology Student"
  // "{role}" in previewTagline is replaced by your first role, so changing the role changes the preview too
  const tagline = text(/\bpreviewTagline:\s*'([^']+)'/, src, '{role}').replace('{role}', role);
  const description = [tagline, status ? status + '.' : ''].filter(Boolean).join(' ');
  return { name, status, role, tagline, description };
}
