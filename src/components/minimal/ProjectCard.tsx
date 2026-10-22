import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ProjectCardData } from './useProjects';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('') || '··';

export const ProjectLogo = ({ src, candidates, title, size = 52 }: { src?: string; candidates?: string[]; title: string; size?: number }) => {
  const list = src ? [src] : candidates ?? [];
  const [i, setI] = useState(0);
  return (
    <div className="app-icon" style={{ width: size, height: size }} aria-hidden="true">
      {i < list.length ? <img src={list[i]} alt="" loading="lazy" onError={() => setI((n) => n + 1)} /> : <span>{initials(title)}</span>}
    </div>
  );
};

const ProjectCard = ({ p, onPreview, onPhone }: { p: ProjectCardData; onPreview?: (slug: string) => void; onPhone?: (p: ProjectCardData) => void }) => (
  <article className="pcard">
    <div className="pcard-top">
      <ProjectLogo src={p.logo} candidates={p.logoCandidates} title={p.title} />
      <div className="min-w-0">
        <div className="pcard-kind">
          {p.kind}
          {p.year ? ` · ${p.year}` : ''}
        </div>
        <h3 className="pcard-title">{p.title}</h3>
      </div>
    </div>

    <p className="pcard-sum">{p.summary}</p>
    {p.tags.length > 0 && <div className="pcard-tags">{p.tags.join('  ·  ')}</div>}

    <div className="pcard-actions">
      {p.liveUrl && p.kind === 'Mobile app' && onPhone ? (
        <>
          <button type="button" className="btn" onClick={() => onPhone(p)}>Try it</button>
          <a href={p.liveUrl} target="_blank" rel="noreferrer" className="arrow-link">New tab <span className="arr">↗</span></a>
        </>
      ) : p.liveUrl ? (
        <a href={p.liveUrl} target="_blank" rel="noreferrer" className="btn">Open demo ↗</a>
      ) : null}
      {!p.liveUrl && p.previewSlug && onPreview && (
        <button type="button" className="btn" onClick={() => onPreview(p.previewSlug!)}>Preview</button>
      )}
      {p.detailsTo && (
        <Link to={p.detailsTo} className={p.liveUrl || p.previewSlug ? 'arrow-link' : 'btn'}>
          Case study <span className="arr">→</span>
        </Link>
      )}
    </div>
  </article>
);

export default ProjectCard;
