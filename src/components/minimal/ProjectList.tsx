import { useState } from 'react';
import { useContent } from '../../contexts/ContentContext';
import { useProjects } from './useProjects';
import ProjectCard from './ProjectCard';
import PreviewModal from './PreviewModal';
import PhoneModal from './PhoneModal';
import type { ProjectCardData } from './useProjects';

/** Plain grid of every project (used on the /projects page). */
const ProjectList = () => {
  const { content } = useContent();
  const cards = useProjects();
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [phone, setPhone] = useState<ProjectCardData | null>(null);
  const previewProject = content.projects.find((p) => p.slug === previewSlug);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.key} className="grid-card">
            <ProjectCard p={c} onPreview={setPreviewSlug} onPhone={setPhone} />
          </div>
        ))}
      </div>
      <PhoneModal url={phone?.liveUrl ?? null} title={phone?.title ?? ''} onClose={() => setPhone(null)} />
      <PreviewModal open={previewSlug !== null} onClose={() => setPreviewSlug(null)} title={previewProject?.title ?? ''} preview={previewProject?.preview} />
    </>
  );
};

export default ProjectList;
