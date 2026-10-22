import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import { resolveImage } from '../../content/icons';
import Section, { fadeUp } from '../../components/minimal/Section';
import PreviewModal, { hasPreview } from '../../components/minimal/PreviewModal';

const ProjectPage = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const [showPreview, setShowPreview] = useState(false);
  const project = content.projects.find((p) => p.slug === slug);

  useEffect(() => window.scrollTo(0, 0), [slug]);

  if (!project) {
    return (
      <div className="page">
        <h1 className="page-title">404</h1>
        <p className="muted mt-4">Project not found.</p>
        <Link to="/#projects" className="arrow-link mt-4">← back to projects</Link>
      </div>
    );
  }

  const icon = resolveImage(project.icon);
  let n = 0;

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

      {project.overview.length > 0 && (
        <Section id="overview" number={++n} title="overview" delay={4}>
          <div className="space-y-4 text-[15px] leading-[1.75]">
            {project.overview.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Section>
      )}

      {project.features.length > 0 && (
        <Section id="features" number={++n} title="features" delay={5}>
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
        <Section id="highlights" number={++n} title="technical highlights" delay={5}>
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
