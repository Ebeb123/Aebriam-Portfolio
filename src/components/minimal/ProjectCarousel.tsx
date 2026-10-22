import { useRef, useState, type CSSProperties } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { useProjects } from './useProjects';
import ProjectCard from './ProjectCard';
import PreviewModal from './PreviewModal';
import PhoneModal from './PhoneModal';
import type { ProjectCardData } from './useProjects';

/**
 * Fanned card stack: the active project sits in front, its neighbours peek out
 * tilted behind it. Click a side card, use the arrows, swipe, or press ← / →.
 */
const ProjectCarousel = () => {
  const { content } = useContent();
  const cards = useProjects();
  const [active, setActive] = useState(0);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [phone, setPhone] = useState<ProjectCardData | null>(null);
  const startX = useRef<number | null>(null);
  const count = cards.length;

  if (count === 0) return <p className="micro">no projects yet</p>;
  const current = Math.min(active, count - 1);

  const go = (dir: number) => setActive((a) => (((Math.min(a, count - 1) + dir) % count) + count) % count);

  // shortest signed distance on a loop, e.g. last card sits to the left of the first
  const offsetOf = (i: number) => {
    let d = i - current;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  };

  const styleFor = (d: number): CSSProperties => {
    const abs = Math.abs(d);
    if (abs === 0) return { transform: 'translateX(-50%) rotate(0deg) scale(1)', zIndex: 30, opacity: 1 };
    if (abs === 1)
      return {
        transform: `translateX(calc(-50% + ${d * 58}%)) translateY(22px) rotate(${d * 5}deg) scale(0.88)`,
        zIndex: 20,
        opacity: 0.55,
      };
    return {
      transform: `translateX(calc(-50% + ${Math.sign(d) * 90}%)) translateY(48px) rotate(${Math.sign(d) * 12}deg) scale(0.74)`,
      zIndex: 10,
      opacity: 0,
      pointerEvents: 'none',
    };
  };

  const previewProject = content.projects.find((p) => p.slug === previewSlug);

  return (
    <div
      className="fan"
      role="region"
      aria-roledescription="carousel"
      aria-label="Projects"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1);
        if (e.key === 'ArrowLeft') go(-1);
      }}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null) return;
        const dx = e.clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="fan-stage">
        {cards.map((c, i) => {
          const d = offsetOf(i);
          const isActive = d === 0;
          return (
            <div
              key={c.key}
              className={`fan-item${isActive ? ' is-active' : ''}`}
              style={styleFor(d)}
              aria-hidden={!isActive}
              onClick={isActive ? undefined : () => setActive(i)}
            >
              <div inert={!isActive}>
                <ProjectCard p={c} onPreview={setPreviewSlug} onPhone={setPhone} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="fan-controls">
        <button type="button" className="fan-arrow" onClick={() => go(-1)} aria-label="Previous project">← Prev</button>
        <span className="fan-count" aria-live="polite">
          <b>{String(current + 1).padStart(2, '0')}</b> / {String(count).padStart(2, '0')}
        </span>
        <button type="button" className="fan-arrow" onClick={() => go(1)} aria-label="Next project">Next →</button>
      </div>

      <PhoneModal url={phone?.liveUrl ?? null} title={phone?.title ?? ''} onClose={() => setPhone(null)} />
      <PreviewModal open={previewSlug !== null} onClose={() => setPreviewSlug(null)} title={previewProject?.title ?? ''} preview={previewProject?.preview} />
    </div>
  );
};

export default ProjectCarousel;
