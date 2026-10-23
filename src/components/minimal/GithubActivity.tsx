import { useEffect, useState } from 'react';

/**
 * "GitHub · 21 public repos · last commit 2 days ago"
 * Live from /api/github (see api/github.js). Hidden if it can't load
 * (for example when running `npm run dev` on your laptop).
 */
type Activity = { publicRepos: number; lastPushAt: string | null; profileUrl: string };

const CACHE_KEY = 'gh-activity-v1';
const CACHE_MS = 30 * 60 * 1000;

const ago = (iso: string) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins} minutes ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return hrs === 1 ? '1 hour ago' : `${hrs} hours ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return days === 1 ? 'yesterday' : `${days} days ago`;
  const months = Math.round(days / 30);
  return months <= 1 ? 'a month ago' : `${months} months ago`;
};

const GithubActivity = ({ url }: { url?: string }) => {
  const [data, setData] = useState<Activity | null>(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { at, value } = JSON.parse(raw);
        if (Date.now() - at < CACHE_MS) return value as Activity;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  useEffect(() => {
    let alive = true;
    fetch('/api/github')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((value: Activity) => {
        if (!alive || typeof value.publicRepos !== 'number') return;
        setData(value);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), value }));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* keep whatever we have; the line stays hidden if nothing loaded */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) return null;
  const link = url || data.profileUrl;

  return (
    <p className="gh-activity">
      <a href={link} target="_blank" rel="noreferrer">GitHub</a>
      <span aria-hidden="true">·</span>
      <span>{data.publicRepos} public repos</span>
      {data.lastPushAt && (
        <>
          <span aria-hidden="true">·</span>
          <span>last commit {ago(data.lastPushAt)}</span>
        </>
      )}
    </p>
  );
};

export default GithubActivity;
