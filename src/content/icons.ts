// Built-in images the admin page can pick from without uploading anything.
import { techStackIcons } from '../assets/techstack';
import PythonIcon from '../assets/techstack/custom/Python.svg';
import LaravelIcon from '../assets/techstack/custom/Laravel.svg';
import SQLServerIcon from '../assets/techstack/custom/SQLServer.svg';
import DotNetIcon from '../assets/techstack/custom/DotNet.svg';
import MSOfficeIcon from '../assets/techstack/custom/MSOffice.svg';
import WordIcon from '../assets/techstack/custom/Word.svg';
import ExcelIcon from '../assets/techstack/custom/Excel.svg';
import badgeGrc from '../assets/badges/grc.png';
import badgeCyberFundamentals from '../assets/badges/cyber_fundamentals.png';
import badgeGettingStarted from '../assets/badges/getting_started_cyber.png';
import badgeDataFundamentals from '../assets/badges/data_fundamentals.png';
import badgeCiscoIntro from '../assets/badges/cisco_intro_cyber.png';
import ibmBadge from '../assets/badges/ibm_skillsbuild_badge.svg';
import ciscoBadge from '../assets/badges/cisco_badge.svg';
import intervaiIcon from '../assets/project_icons/intervai.svg';
import { comingSoon } from '../assets';

const t = techStackIcons as Record<string, string>;

export const builtinIcons: Record<string, { label: string; src: string; group: 'skill' | 'badge' | 'project' }> = {
  'cs': { label: 'C#', src: t.CS, group: 'skill' },
  'dotnet': { label: '.NET', src: DotNetIcon, group: 'skill' },
  'java': { label: 'Java', src: t.JavaLight, group: 'skill' },
  'c': { label: 'C', src: t.C, group: 'skill' },
  'cpp': { label: 'C++', src: t.CPP, group: 'skill' },
  'python': { label: 'Python', src: PythonIcon, group: 'skill' },
  'react': { label: 'React', src: t.ReactLight, group: 'skill' },
  'laravel': { label: 'Laravel', src: LaravelIcon, group: 'skill' },
  'sqlserver': { label: 'SQL Server', src: SQLServerIcon, group: 'skill' },
  'msoffice': { label: 'MS Office', src: MSOfficeIcon, group: 'skill' },
  'word': { label: 'Microsoft Word', src: WordIcon, group: 'skill' },
  'excel': { label: 'Microsoft Excel', src: ExcelIcon, group: 'skill' },
  'javascript': { label: 'JavaScript', src: t.JavaScript, group: 'skill' },
  'typescript': { label: 'TypeScript', src: t.TypeScript, group: 'skill' },
  'html': { label: 'HTML', src: t.HTML, group: 'skill' },
  'css': { label: 'CSS', src: t.CSS, group: 'skill' },
  'tailwind': { label: 'Tailwind CSS', src: t.TailwindCSSLight, group: 'skill' },
  'nodejs': { label: 'Node.js', src: t.NodeJSLight, group: 'skill' },
  'mongodb': { label: 'MongoDB', src: t.MongoDB, group: 'skill' },
  'docker': { label: 'Docker', src: t.Docker, group: 'skill' },
  'github': { label: 'GitHub', src: t.GithubLight, group: 'skill' },
  'postman': { label: 'Postman', src: t.Postman, group: 'skill' },
  'aws': { label: 'AWS', src: t.AWSLight, group: 'skill' },
  'tensorflow': { label: 'TensorFlow', src: t.TensorFlowLight, group: 'skill' },
  'flutter': { label: 'Flutter', src: t.FlutterLight, group: 'skill' },
  'unity': { label: 'Unity', src: t.UnityLight, group: 'skill' },
  'ibm': { label: 'IBM SkillsBuild badge', src: ibmBadge, group: 'badge' },
  'badge-grc': { label: 'IBM — Governance, Risk, Compliance, and Data Privacy', src: badgeGrc, group: 'badge' },
  'badge-cyber-fundamentals': { label: 'IBM — Cybersecurity Fundamentals', src: badgeCyberFundamentals, group: 'badge' },
  'badge-getting-started': { label: 'IBM — Getting Started with Cybersecurity', src: badgeGettingStarted, group: 'badge' },
  'badge-data-fundamentals': { label: 'IBM — Data Fundamentals', src: badgeDataFundamentals, group: 'badge' },
  'badge-cisco-intro': { label: 'Cisco — Introduction to Cybersecurity', src: badgeCiscoIntro, group: 'badge' },
  'cisco': { label: 'Cisco badge', src: ciscoBadge, group: 'badge' },
  'intervai': { label: 'IntervAI icon', src: intervaiIcon, group: 'project' },
  'code': { label: 'Generic </> icon', src: comingSoon, group: 'project' },
};

/** Turns "builtin:key" into an image URL; passes real URLs through. */
export const resolveImage = (value: string | undefined | null): string => {
  if (!value) return '';
  if (value.startsWith('builtin:')) return builtinIcons[value.slice(8)]?.src ?? '';
  return value;
};
