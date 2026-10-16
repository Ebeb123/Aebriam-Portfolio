// Shape of everything the admin page can edit.
// Images/icons are either a URL (uploaded file or link) or "builtin:<key>" (see icons.ts).

export type LabelValue = { label: string; value: string };

export type ProjectFeature = { title: string; description: string; icon?: string };

export type ProjectPreviewData = {
  liveUrl: string;
  video: string;
  images: string[];
};

export type ProjectData = {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  technologies: string[];
  githubUrl: string;
  overview: string[];
  features: ProjectFeature[];
  highlights: string[];
  preview: ProjectPreviewData;
};

export type ExperienceData = {
  title: string;
  company: string;
  location: string;
  period: string;
  description: string[];
};

export type SkillData = { name: string; icon: string };

export type CertificationData = {
  title: string;
  subtitle: string;
  image: string;
  credentialUrl: string;
};

export type GithubRepoInfo = {
  name: string;
  description: string;
  htmlUrl: string;
  homepage: string;
  topics: string[];
  stars: number;
  pushedAt: string;
  languages: { name: string; pct: number }[];
  fullName?: string;       // "owner/repo" — used to find the repo's logo
  defaultBranch?: string;  // e.g. "main"
};

export type SiteContent = {
  profile: {
    name: string;        // full name (badge, footer, page title)
    shortName: string;   // used in "Hi, I'm ___"
    navName: string;     // top-left name in the navigation bar
    handle: string;      // shown in the hero terminal, e.g. aebriam.lawas
    roles: string[];     // typewriter roles
    photo: string;
    resumeUrl: string;
  };
  about: {
    org: string;
    fields: LabelValue[];
    status: string;
    terminalTitle: string;
    cmdAbout: string;
    paragraphs: string[];
    cmdHighlights: string;
    highlights: string[];
  };
  projects: ProjectData[];
  experience: ExperienceData[];
  skills: SkillData[];
  certifications: CertificationData[];
  contact: {
    tagline: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
  };
};
