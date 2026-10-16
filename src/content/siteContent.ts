/* =====================================================================
   EDIT YOUR PORTFOLIO HERE
   Everything on the site (except your GitHub repos) comes from this file.
   - Lists: add/remove items between the [ ] brackets.
   - Images/files: put them in /public and use '/file-name.png',
     or use a built-in icon like 'builtin:python' (see icons.ts).
   - GitHub repos: see github.config.json (no need to touch this file).
   ===================================================================== */
import type { SiteContent } from './types';
import { profile1 } from '../assets';

export const siteContent: SiteContent = {
  profile: {
    name: 'Aebriam C. Lawas',
    shortName: 'Aebriam',
    navName: 'Aebriam Lawas',
    handle: 'aebriam.lawas',
    roles: ['BS Information Technology Student', 'Robotics Working Scholar', 'Web Developer', 'App Developer', 'AI Enthusiast', 'Cybersecurity enthusiast', ],
    photo: profile1,
    resumeUrl: '/resume.pdf',
  },
  about: {
    org: 'UCLM · Information Technology',
    fields: [
      { label: 'Role', value: 'IT Student' },
      { label: 'Focus', value: 'Cybersecurity & Web Development' },
      { label: 'Base', value: 'Mandaue City, Cebu' },
      { label: 'Class', value: '2026' },
    ],
    status: 'ACCESS GRANTED',
    terminalTitle: 'aebriam@portfolio: ~/about',
    cmdAbout: 'Me about.txt',
    paragraphs: [
      'Fourth-year BS Information Technology student at the University of Cebu Lapu-Lapu and Mandaue, growing my focus on cybersecurity.',
      'I code in C#/.NET, Java, C, and Python, design databases in SQL Server, and enjoy finding vulnerabilities and applying security best practices.',
    ],
    cmdHighlights: 'ls highlights/',
    highlights: [
      'robotics working scholar since 2024',
      '5 certifications from IBM SkillsBuild & Cisco',
      'capstone: IntervAI — AI mock interview system',
    ],
  },
  projects: [
    {
      slug: 'intervai',
      title: 'IntervAI',
      summary: 'AI-powered mock interview system with multimodal assessment and real-time feedback — our capstone project at UCLM.',
      icon: 'builtin:intervai',
      technologies: ['Python', 'Speech Analysis', 'Facial Expression', 'NLP', 'Cerebras'],
      githubUrl: '',
      overview: [
        'IntervAI is our academic capstone project at the University of Cebu Lapu-Lapu and Mandaue. It helps job applicants practice interviews by evaluating how they answer, not only what they say.',
        'The system analyzes a recorded answer across three pillars — voice, facial expression, and answer content — then returns a score and concrete suggestions so the user can practice again and improve.',
      ],
      features: [
        { title: 'Speech & Voice Analysis', description: 'Evaluates vocal delivery using models trained on RAVDESS, CREMA-D, TESS, and SAVEE.', icon: 'mic' },
        { title: 'Facial Expression Analysis', description: 'Reads facial expressions with models trained on FER-2013 and RAF-DB.', icon: 'face' },
        { title: 'Answer Content Evaluation', description: 'Assesses what the applicant says using NLP powered by Cerebras.', icon: 'message' },
        { title: 'Scoring & Feedback', description: 'Combines all three into a score plus an Answer Improvement Assistant for repeated practice.', icon: 'gauge' },
      ],
      highlights: [
        'Multimodal pipeline combining three analysis modules into one interview score.',
        'Six training datasets across speech (RAVDESS, CREMA-D, TESS, SAVEE) and facial expression (FER-2013, RAF-DB).',
        'Answer content evaluation through the Cerebras LLM API.',
        'Feedback and scoring engine with an Answer Improvement Assistant for iterative practice.',
      ],
      preview: { liveUrl: '', video: '', images: [] },
    },
  ],
  experience: [
    {
      title: 'Robotics Working Scholar',
      company: 'University of Cebu Lapu-Lapu and Mandaue — Senior High School Department',
      location: 'Mandaue City, Cebu',
      period: '2024 - Present',
      description: [
        'Assist in facilitating robotics instruction and hands-on laboratory activities for senior high school students.',
        'Support the setup, testing, and troubleshooting of robotics equipment and student projects.',
      ],
    },
  ],
  skills: [
    { name: 'C#', icon: 'builtin:cs' },
    { name: '.NET Framework', icon: 'builtin:dotnet' },
    { name: 'Java', icon: 'builtin:java' },
    { name: 'C', icon: 'builtin:c' },
    { name: 'Python', icon: 'builtin:python' },
    { name: 'React', icon: 'builtin:react' },
    { name: 'Laravel', icon: 'builtin:laravel' },
    { name: 'SQL Server', icon: 'builtin:sqlserver' },
    { name: 'Microsoft Word', icon: 'builtin:word' },
    { name: 'Microsoft Excel', icon: 'builtin:excel' },
    { name: 'JavaScript', icon: 'builtin:javascript' },
    { name: 'HTML', icon: 'builtin:html' },
    { name: 'CSS', icon: 'builtin:css' },
    { name: 'Tailwind CSS', icon: 'builtin:tailwind' },
    { name: 'Node.js', icon: 'builtin:nodejs' },
  ],
  certifications: [
    { title: 'Cybersecurity Fundamentals', subtitle: 'IBM SkillsBuild', image: 'builtin:badge-cyber-fundamentals', credentialUrl: '' },
    { title: 'Getting Started with Cybersecurity', subtitle: 'IBM SkillsBuild', image: 'builtin:badge-getting-started', credentialUrl: '' },
    { title: 'Governance, Risk, Compliance, and Data Privacy', subtitle: 'IBM SkillsBuild', image: 'builtin:badge-grc', credentialUrl: '' },
    { title: 'Data Fundamentals', subtitle: 'IBM SkillsBuild', image: 'builtin:badge-data-fundamentals', credentialUrl: '' },
    { title: 'Introduction to Cybersecurity', subtitle: 'Cisco', image: 'builtin:badge-cisco-intro', credentialUrl: '' },
  ],
  contact: {
    tagline: 'Open to internships, OJT, and entry-level IT opportunities — feel free to reach out.',
    email: 'Aebriamlawas@gmail.com',
    phone: '+63 999 989 8892',
    github: '',
    linkedin: '',
  },
};
