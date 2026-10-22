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
    roles: ['BS Information Technology Student', 'Robotics Working Scholar', 'Mobile App Developer', 'Web Developer', 'Cybersecurity Enthusiast'],
    photo: profile1,
    resumeUrl: '/resume.pdf',
  },
  about: {
    org: 'UCLM · Information Technology',
    fields: [
      { label: 'Role', value: 'IT Student' },
      { label: 'Focus', value: 'Mobile, Web & Cybersecurity' },
      { label: 'Base', value: 'Mandaue City, Cebu' },
      { label: 'Class', value: '2027' },
    ],
    status: 'Open to internships & OJT',
    terminalTitle: 'aebriam@portfolio: ~/about',
    cmdAbout: 'cat about.txt',
    paragraphs: [
      'Fourth-year BS Information Technology student at the University of Cebu Lapu-Lapu and Mandaue, growing my focus on cybersecurity.',
      'I build offline-first mobile and web apps with React Native, Expo, React and Laravel, work with SQLite and MySQL, and enjoy finding vulnerabilities and applying security best practices.',
    ],
    cmdHighlights: 'ls highlights/',
    highlights: [
      'robotics working scholar 2024 – 2026 · managing 87 robotics kits',
      'shipped 2 Android apps in 2026: Budgee & ShuttleFlow',
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
      period: '2024 - 2026',
      description: [
        'Assist in facilitating robotics instruction and hands-on laboratory activities for senior high school students.',
        'Manage the setup, testing, and troubleshooting of 87 robotics kits (29 Arduino, 29 Raspberry Pi, and 29 LEGO EV3) for student projects.',
      ],
    },
  ],
  education: [
    { school: 'University of Cebu Lapu-Lapu and Mandaue', program: 'BS Information Technology', period: '2023 - 2027', location: 'Mandaue City, Cebu' },
    { school: 'Asian College of Technology – Main Campus', program: 'Senior High School — STEM', period: '2020 - 2022', location: 'Cebu City' },
    { school: 'Don Gerardo Ll. Ouano Memorial National High School', program: 'TVL — Computer', period: '2014 - 2019', location: 'Mandaue City, Cebu' },
  ],
  skills: [
    { name: 'Java', icon: 'builtin:java', group: 'Languages' },
    { name: 'Python', icon: 'builtin:python', group: 'Languages' },
    { name: 'JavaScript', icon: 'builtin:javascript', group: 'Languages' },
    { name: 'TypeScript', icon: 'builtin:typescript', group: 'Languages' },
    { name: 'HTML', icon: 'builtin:html', group: 'Languages' },
    { name: 'CSS', icon: 'builtin:css', group: 'Languages' },
    { name: 'PHP', icon: '', group: 'Languages' },
    { name: 'Laravel', icon: 'builtin:laravel', group: 'Frameworks' },
    { name: 'React', icon: 'builtin:react', group: 'Frameworks' },
    { name: 'React Native', icon: 'builtin:react', group: 'Frameworks' },
    { name: 'Expo', icon: '', group: 'Frameworks' },
    { name: 'SQLite', icon: '', group: 'Databases' },
    { name: 'MySQL', icon: '', group: 'Databases' },
    { name: 'Git', icon: '', group: 'Tools & hardware' },
    { name: 'Arduino', icon: '', group: 'Tools & hardware' },
    { name: 'Raspberry Pi', icon: '', group: 'Tools & hardware' },
    { name: 'LEGO EV3', icon: '', group: 'Tools & hardware' },
    { name: 'C#', icon: 'builtin:cs', group: 'Familiar with' },
    { name: '.NET Framework', icon: 'builtin:dotnet', group: 'Familiar with' },
    { name: 'C', icon: 'builtin:c', group: 'Familiar with' },
    { name: 'Microsoft Office', icon: 'builtin:msoffice', group: 'Tools & hardware' },
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
    github: 'https://github.com/ebeb123',
    linkedin: '',
    facebook: 'https://www.facebook.com/ebeb1245/',
  },
};
