import { useEffect, useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { fetchPortfolioRepos, githubConfig, githubSnapshot, sortRepos } from '../../lib/github';
import { resolveImage } from '../../content/icons';
import type { GithubRepoInfo } from '../../content/types';
import { hasPreview } from './PreviewModal';

/** Images the card looks for inside each repo (first one that exists wins). */
const REPO_LOGO_PATHS = ['portfolio-logo.png', 'logo.png', 'logo.svg', 'assets/icon.png', 'assets/images/icon.png', 'public/logo.png'];

export type ProjectCardData = {
  key: string;
  title: string;
  summary: string;
  kind: string; // black chip, e.g. "Mobile app"
  tags: string[]; // outline chips
  logo?: string;
  logoCandidates?: string[];
  detailsTo?: string; // internal case-study page
  repoUrl?: string;
  liveUrl?: string;
  previewSlug?: string; // opens the preview modal
  year?: string;
};

const SMALL = new Set(['for', 'with', 'and', 'of', 'the', 'to', 'in', 'a', 'an']);

/** "MASTER-TRACKER-FOR-STUDENTS-DEMO-" → "Master Tracker for Students" */
export const prettyRepoName = (name: string) => {
  let words = name.replace(/[-_]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length > 1 && /^demo$/i.test(words[words.length - 1])) words = words.slice(0, -1);
  const allCaps = name === name.toUpperCase();
  return words
    .map((w, i) => {
      if (!allCaps) return w;
      const lw = w.toLowerCase();
      if (i > 0 && SMALL.has(lw)) return lw;
      return lw[0].toUpperCase() + lw.slice(1);
    })
    .join(' ');
};

const repoKind = (r: GithubRepoInfo) => {
  const t = r.topics.map((x) => x.toLowerCase());
  const d = r.description.toLowerCase();
  if (t.includes('mobile-app') || t.includes('react-native') || d.includes('react native') || d.includes('expo')) return 'Mobile app';
  if (t.includes('chrome-extension') || d.includes('chrome extension')) return 'Browser extension';
  if (t.includes('google-apps-script') || r.homepage.includes('script.google.com') || d.includes('apps script')) return 'Web app';
  if (r.homepage) return 'Web app';
  return r.languages[0]?.name ?? 'Project';
};

export const useProjects = () => {
  const { content } = useContent();
  const gh = githubConfig;
  const [repos, setRepos] = useState<GithubRepoInfo[]>(() => sortRepos(githubSnapshot, gh.order));

  useEffect(() => {
    let alive = true;
    fetchPortfolioRepos()
      .then((r) => alive && setRepos(r))
      .catch(() => {
        /* keep the build-time snapshot */
      });
    return () => {
      alive = false;
    };
  }, []);

  const manual: ProjectCardData[] = content.projects.map((p) => ({
    key: `p-${p.slug}`,
    title: p.title,
    summary: p.summary,
    kind: 'Capstone',
    tags: p.technologies.slice(0, 3),
    year: 'Ongoing',
    logo: resolveImage(p.icon) || undefined,
    detailsTo: `/projects/${p.slug}`,
    repoUrl: p.githubUrl || undefined,
    liveUrl: p.preview.liveUrl || undefined,
    previewSlug: hasPreview(p.preview) ? p.slug : undefined,
  }));

  const fromGithub: ProjectCardData[] = repos.map((r) => {
    const o = gh.overrides?.[r.name] ?? {};
    const topics = r.topics.filter((t) => !['mobile-app', 'react-native', 'school-project'].includes(t.toLowerCase()));
    const lang = r.languages[0]?.name;
    return {
      key: `gh-${r.name}`,
      title: o.title || prettyRepoName(r.name),
      summary: o.description || r.description || 'No description yet.',
      kind: repoKind(r),
      tags: [...(lang ? [lang] : []), ...(gh.showTopics && !o.hideTopics ? topics.map((t) => t.replace(/-/g, ' ')) : [])].slice(0, 3),
      logoCandidates: r.fullName
        ? REPO_LOGO_PATHS.map((p) => `https://raw.githubusercontent.com/${r.fullName}/${r.defaultBranch || 'main'}/${p}`)
        : [],
      liveUrl: r.homepage ? (r.homepage.startsWith('http') ? r.homepage : `https://${r.homepage}`) : undefined,
      year: r.pushedAt ? r.pushedAt.slice(0, 4) : undefined,
    };
  });

  return gh.position === 'before' ? [...fromGithub, ...manual] : [...manual, ...fromGithub];
};
