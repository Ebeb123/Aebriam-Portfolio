import { useEffect, useState } from 'react';
import type { CertificationData } from '../../content/types';

/**
 * Certifications, kept in sync with Credly.
 * Shows the list from siteContent.ts right away, then swaps in the live list
 * from /api/credly (see api/credly.js). New Credly badges appear on their own.
 */
const CACHE_KEY = 'credly-badges-v1';
const CACHE_MS = 60 * 60 * 1000; // 1 hour

type ApiBadge = { id: string; title: string; issuer: string; image: string; url: string };

const toCert = (b: ApiBadge): CertificationData => ({
  title: b.title,
  subtitle: b.issuer,
  image: b.image,
  credentialUrl: b.url,
});

export const useCredlyBadges = (fallback: CertificationData[]) => {
  const [certs, setCerts] = useState<CertificationData[]>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { at, list } = JSON.parse(raw) as { at: number; list: CertificationData[] };
        if (Array.isArray(list) && list.length && Date.now() - at < CACHE_MS) return list;
      }
    } catch {
      /* ignore */
    }
    return fallback;
  });

  useEffect(() => {
    let alive = true;
    fetch('/api/credly')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: { badges?: ApiBadge[] }) => {
        const list = (json.badges || []).filter((b) => b.image && b.url).map(toCert);
        if (!alive || list.length === 0) return;
        setCerts(list);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), list }));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* offline / local dev: keep the list from siteContent.ts */
      });
    return () => {
      alive = false;
    };
  }, []);

  return certs;
};
