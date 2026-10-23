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

/** Card screenshot: the set image, or the first candidate that loads. Hidden if none load. */
const useShot = (p: ProjectCardData) => {
  const list = p.image ? [p.image] : p.imageCandidates ?? [];
  const [i, setI] = useState(0);
  return { src: i < list.length ? list[i] : undefined, next: () => setI((n) => n + 1) };
};

const ProjectCard = ({ p, onPreview, onPhone }: { p: ProjectCardData; onPreview?: (slug: string) => void; onPhone?: (p: ProjectCardData) => void }) => {
  const shot = useShot(p);
  return (
  <article className={`pcard${shot.src ? ' has-shot' : ''}`}>
    {shot.src && (
      <div className="pcard-shot">
        <img src={shot.src} alt={`${p.title} screenshot`} loading="lazy" draggable={false} onError={shot.next} />
      </div>
    )}
    <div className="pcard-top">
      {!shot.src && <ProjectLogo src={p.logo} candidates={p.logoCandidates} title={p.title} />}
      <div className="min-w-0">
        <div className="pcard-kind">
          {p.kind}
          {p.year ? ` · ${p.year}` : ''}
        </div>
        <h3 className="pcard-title">{p.title}</h3>
      </div>
    </div>

    <p className="pcard-sum">{p.summary}</p>
    {!shot.src && p.tags.length > 0 && <div className="pcard-tags">{p.tags.join('  ·  ')}</div>}

    <div className="pcard-actions">
      {p.liveUrl && p.kind === 'Mobile app' && onPhone ? (
        <button type="button" className="btn" onClick={() => onPhone(p)}>Try it</button>
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
};

export default ProjectCard;
