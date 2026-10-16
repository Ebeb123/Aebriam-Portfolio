// Main assets module - consolidates common assets
import aboutMeJournalPng from './journal.PNG';
import aboutMeJournalWebp800 from './journal.PNG';
import aboutMeJournalWebp400 from './journal.PNG';
// Profile images (shown when the journal is clicked)
import profile1 from './profile1.png';
const profile2 = profile1;
const profile3 = profile1;
import comingSoon from './coming_soon.svg';
import divider from './divider.svg';

// For backward compatibility
const aboutMeJournal = aboutMeJournalPng;

// Re-export all asset modules
export * from './project_icons';
export * from './techstack';

// Export main assets
export const mainAssets = {
  aboutMeJournal,
  aboutMeJournalPng,
  aboutMeJournalWebp800,
  aboutMeJournalWebp400,
  profile1,
  profile2,
  profile3,
  comingSoon,
  divider,
};

export {
  aboutMeJournal,
  aboutMeJournalPng,
  aboutMeJournalWebp800,
  aboutMeJournalWebp400,
  profile1,
  profile2,
  profile3,
  comingSoon,
  divider,
};

export default {
  mainAssets,
};
