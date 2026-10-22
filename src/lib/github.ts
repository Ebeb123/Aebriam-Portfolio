// Loads your portfolio repos straight from GitHub (public API, no token).
// A repo is shown when it has the topic set in src/content/github.config.json (default: "portfolio").
import type { GithubRepoInfo } from '../content/types';
import config from '../content/github.config.json';
import snapshot from '../content/github-snapshot.json';

export type RepoOverride = { title?: string; description?: string; hideTopics?: boolean };

export type GithubConfig = {
  username: string;
  topic: string;
  position: 'before' | 'after';
  showTopics: boolean;
  order: string[];
  /** Show a different name / description on the site than on GitHub (key = repo name). */
  overrides?: Record<string, RepoOverride>;
};

export const githubConfig = config as GithubConfig;
/** Saved at build time (scripts/fetch-github.mjs) so cards show instantly and when GitHub is unreachable. */
export const githubSnapshot = snapshot as GithubRepoInfo[];

const API = 'https://api.github.com';
const TTL_MS = 10 * 60 * 1000; // browsers re-check GitHub at most every 10 minutes

const getJson = async (url: string) => {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  return res.json();
};

/** Applies the order list from the config; the rest are newest-first. */
export const sortRepos = (repos: GithubRepoInfo[], order: string[]) => {
  const rank = (name: string) => {
    const i = order.findIndex((o) => o.toLowerCase() === name.toLowerCase());
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...repos].sort((a, b) => rank(a.name) - rank(b.name) || b.pushedAt.localeCompare(a.pushedAt));
};

export const fetchPortfolioRepos = async (cfg: GithubConfig = githubConfig): Promise<GithubRepoInfo[]> => {
  const key = `gh-portfolio-v3:${cfg.username.toLowerCase()}:${cfg.topic}`;
  let stale: GithubRepoInfo[] | null = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { at, value } = JSON.parse(raw);
      if (Date.now() - at < TTL_MS) return value;
      stale = value; // too old, but still better than nothing if GitHub says "rate limit"
    }
  } catch {
    /* ignore */
  }

  let list: Array<Record<string, any>>;
  try {
    // cache: 'no-store' so a newly tagged repo shows up right away
    const res = await fetch(`${API}/users/${encodeURIComponent(cfg.username)}/repos?per_page=100&sort=pushed`, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    list = await res.json();
  } catch (err) {
    // GitHub allows 60 requests per hour per visitor without a token; fall back to the last good list.
    if (stale) return stale;
    throw err;
  }
  const topic = cfg.topic.toLowerCase();
  const picked = list.filter((r) => (r.topics ?? []).map((t: string) => t.toLowerCase()).includes(topic));

  const repos = await Promise.all(
    picked.map(async (r) => {
      let languages: { name: string; pct: number }[] = [];
      try {
        const langs = (await getJson(r.languages_url)) as Record<string, number>;
        const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;
        languages = Object.entries(langs)
          .sort((a, b) => b[1] - a[1])
          .map(([name, bytes]) => ({ name, pct: Math.round((bytes / total) * 1000) / 10 }));
      } catch {
        if (r.language) languages = [{ name: r.language, pct: 100 }];
      }
      return {
        name: String(r.name),
        description: r.description ?? '',
        htmlUrl: r.html_url,
        homepage: r.homepage ?? '',
        topics: (r.topics ?? []).filter((t: string) => t.toLowerCase() !== topic),
        stars: r.stargazers_count ?? 0,
        pushedAt: r.pushed_at ?? '',
        languages,
        fullName: r.full_name ?? '',
        defaultBranch: r.default_branch ?? 'main',
      } as GithubRepoInfo;
    }),
  );

  const sorted = sortRepos(repos, cfg.order);
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), value: sorted }));
  } catch {
    /* ignore */
  }
  return sorted;
};

// GitHub's language colors for common languages
const LANG_COLORS: Record<string, string> = {
  'C#': '#178600', Java: '#b07219', Python: '#3572A5', JavaScript: '#f1e05a', TypeScript: '#3178c6',
  HTML: '#e34c26', CSS: '#663399', SCSS: '#c6538c', PHP: '#4F5D95', Blade: '#f7523f', C: '#555555',
  'C++': '#f34b7d', Vue: '#41b883', Dart: '#00B4AB', Kotlin: '#A97BFF', Swift: '#F05138', Go: '#00ADD8',
  Rust: '#dea584', Ruby: '#701516', Shell: '#89e051', PowerShell: '#012456', 'Jupyter Notebook': '#DA5B0B',
  'Visual Basic .NET': '#945db7', TSQL: '#e38c00', PLSQL: '#dad8d8', Lua: '#000080', R: '#198CE7',
  Dockerfile: '#384d54', Batchfile: '#C1F12E', Hack: '#878787', 'ASP.NET': '#9400ff', Svelte: '#ff3e00',
  Astro: '#ff5a03', MATLAB: '#e16737', Arduino: '#bd79d1', 'Objective-C': '#438eff',
};
export const languageColor = (name: string) => LANG_COLORS[name] ?? '#8b949e';
