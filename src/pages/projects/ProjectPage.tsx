import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Shield, Code, Database, Cpu, Zap, Layers } from 'lucide-react';
import { featureIcons } from '../../content/featureIcons';
import ProjectLayout from '../../components/project/ProjectLayout';
import ProjectHeader from '../../components/project/ProjectHeader';
import ProjectSection from '../../components/project/ProjectSection';
import ProjectOverview from '../../components/project/ProjectOverview';
import TechStack from '../../components/project/TechStack';
import TechnicalHighlights from '../../components/project/TechnicalHighlights';
import ProjectPreviewModal from '../../components/ProjectPreviewModal';
import { useContent } from '../../contexts/ContentContext';
import { resolveImage } from '../../content/icons';
import { comingSoon } from '../../assets';

const fallbackIcons = [Zap, Layers, Shield, Code, Database, Cpu];

const ProjectPage = () => {
  const { slug } = useParams();
  const { content } = useContent();
  const [showPreview, setShowPreview] = useState(false);
  const project = content.projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <ProjectLayout>
        <p className="text-lg">Project not found.</p>
        <Link to="/#projects" className="underline">Back to projects</Link>
      </ProjectLayout>
    );
  }

  return (
    <ProjectLayout>
      <ProjectHeader
        icon={resolveImage(project.icon) || comingSoon}
        title={project.title}
        subtitle={project.summary}
        githubUrl={project.githubUrl}
        onPreview={() => setShowPreview(true)}
        features={project.features.map((f, i) => ({
          icon: (f.icon && featureIcons[f.icon]) || fallbackIcons[i % fallbackIcons.length],
          title: f.title,
          description: f.description,
        }))}
      />

      {project.overview.length > 0 && (
        <ProjectSection title="Overview">
          <ProjectOverview paragraphs={project.overview} />
        </ProjectSection>
      )}

      {project.technologies.length > 0 && (
        <ProjectSection title="Tech Stack">
          <TechStack technologies={project.technologies} />
        </ProjectSection>
      )}

      {project.highlights.length > 0 && (
        <ProjectSection title="Technical Highlights">
          <TechnicalHighlights highlights={project.highlights} />
        </ProjectSection>
      )}

      <ProjectPreviewModal open={showPreview} onClose={() => setShowPreview(false)} title={project.title} preview={project.preview} />
    </ProjectLayout>
  );
};

export default ProjectPage;
