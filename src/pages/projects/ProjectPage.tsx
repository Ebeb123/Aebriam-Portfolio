import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import { resolveImage } from '../../content/icons';
import { githubConfig } from '../../lib/github';
import type { CaseStudy } from '../../content/types';
import Section, { fadeUp } from '../../components/minimal/Section';
import PreviewModal, { hasPreview } from '../../components/minimal/PreviewModal';
import PhoneModal from '../../components/minimal/PhoneModal';
import { useProjects } from '../../components/minimal/useProjects';

/** Problem / role / stack / result block shared by every case study. */
const AtAGlance = ({ cs, delay }: { cs: CaseStudy; delay: number }) => (
  <Section id="glance" title="At a glance" delay={delay}>
    <div className="glance">
      <div className="glance-row">
        <div className="k">Problem</div>
        <p>{cs.problem}</p>
      </div>
      <div className="glance-row">
        <div className="k">My role</div>
        <p>{cs.role}</p>
      </div>
      <div className="glance-row">
        <div className="k">Stack</div>
        <p>{cs.stack.join(' · ')}</p>
      </div>
      <div className="glance-row">
        <div className="k">Result</div>
        <ul>
          {cs.result.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  </Section>
);

const NotFound = () => (
  <div className="page">
    <h1 className="page-title">404</h1>
    <p className="muted mt-4">Project not found.</p>
    <Link to="/#projects" className="arrow-link mt-4">← back to projects</Link>
  </div>
);

const ProjectPage = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const cards = useProjects();
  const [showPreview, setShowPreview] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);

  useEffect(() => window.scrollTo(0, 0), [slug]);

  const project = content.projects.find((p) => p.slug === slug);

  // ---------- a GitHub project with a case study in github.config.json ----------
  if (!project) {
    const entry = Object.entries(githubConfig.overrides ?? {}).find(([, o]) => o.slug === slug && o.caseStudy);
    if (!entry) return <NotFound />;
    const [repoName, o] = entry;
    const card = cards.find((c) => c.key === `gh-${repoName}`);
    const title = card?.title ?? o.title ?? repoName;
    const isMobile = (card?.kind ?? o.kind) === 'Mobile app';

    return (
      <div className="page">
        <Link to="/#projects" className="arrow-link">← projects</Link>

        <header className="mt-8">
          <div style={fadeUp(0).style} className="fade-up micro">
            {card?.kind ?? o.kind ?? 'Project'}
            {card?.year ? ` · ${card.year}` : ''}
          </div>
          <h1 style={fadeUp(1).style} className="fade-up page-title mt-2">{title}</h1>
          {(card?.summary || o.description) && (
            <p style={fadeUp(2).style} className="fade-up mt-5 text-[15px] muted leading-relaxed">{card?.summary || o.description}</p>
          )}
          {card?.liveUrl && (
            <div style={fadeUp(3).style} className="fade-up mt-6 flex flex-wrap items-center gap-4">
              {isMobile ? (
                <button type="button" className="btn" onClick={() => setPhoneOpen(true)}>Try it</button>
              ) : (
                <a href={card.liveUrl} target="_blank" rel="noreferrer" className="btn">Open demo ↗</a>
              )}
              <span className="micro">Live demo with sample data</span>
            </div>
          )}
        </header>

        {o.image && (
          <figure style={fadeUp(4).style} className="fade-up cs-shot">
            <img src={o.image} alt={`${title} screenshot`} />
          </figure>
        )}

        <AtAGlance cs={o.caseStudy!} delay={5} />

        <PhoneModal url={phoneOpen ? card?.liveUrl ?? null : null} title={title} onClose={() => setPhoneOpen(false)} />
      </div>
    );
  }

  // ---------- a project written in siteContent.ts (e.g. IntervAI) ----------
  const icon = resolveImage(project.icon);

  return (
    <div className="page">
      <Link to="/#projects" className="arrow-link">← projects</Link>

      <header className="mt-8">
        <div style={fadeUp(0).style} className="fade-up flex items-center gap-3">
          {icon && (
            <div className="monogram"><img src={icon} alt="" /></div>
          )}
          <h1 className="page-title">{project.title}</h1>
        </div>
        <p style={fadeUp(1).style} className="fade-up mt-5 text-[15px] muted leading-relaxed">{project.summary}</p>

        {project.technologies.length > 0 && (
          <div style={fadeUp(2).style} className="fade-up mt-5 flex flex-wrap gap-1.5">
            {project.technologies.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}

        <div style={fadeUp(3).style} className="fade-up mt-6 flex flex-wrap gap-2">
          {hasPreview(project.preview) && (
            <button type="button" className="btn" onClick={() => setShowPreview(true)}>preview ↗</button>
          )}
        </div>
      </header>

      {project.image && (
        <figure style={fadeUp(4).style} className="fade-up cs-shot">
          <img src={project.image} alt={`${project.title} cover`} />
        </figure>
      )}

      {project.caseStudy && <AtAGlance cs={project.caseStudy} delay={4} />}

      {project.overview.length > 0 && (
        <Section id="overview" title="Overview" delay={4}>
          <div className="space-y-4 text-[15px] leading-[1.75]">
            {project.overview.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Section>
      )}

      {project.features.length > 0 && (
        <Section id="features" title="Features" delay={5}>
          <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))' }}>
            {project.features.map((f, i) => (
              <div key={f.title} className="!p-4">
                <div className="micro">{String(i + 1).padStart(2, '0')}</div>
                <div className="text-[14px] font-medium mt-1">{f.title}</div>
                <p className="text-[13px] muted mt-1 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {project.highlights.length > 0 && (
        <Section id="highlights" title="Technical highlights" delay={5}>
          <ul className="space-y-2">
            {project.highlights.map((h) => (
              <li key={h} className="text-[14px] flex gap-2">
                <span className="faint font-mono-ui">—</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <PreviewModal open={showPreview} onClose={() => setShowPreview(false)} title={project.title} preview={project.preview} />
    </div>
  );
};

export default ProjectPage;
