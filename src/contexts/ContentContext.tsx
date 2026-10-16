import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { siteContent } from '../content/siteContent';
import type { SiteContent } from '../content/types';

// Content comes from src/content/siteContent.ts (edit that file to change the site).
const ContentContext = createContext<{ content: SiteContent }>({ content: siteContent });

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    document.title = siteContent.profile.name;
  }, []);
  return <ContentContext.Provider value={{ content: siteContent }}>{children}</ContentContext.Provider>;
};

export const useContent = () => useContext(ContentContext);

/** Contact links in the shape the Contact page and Footer use. */
export const useSocialLinks = () => {
  const c = siteContent.contact;
  const strip = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return {
    email: c.email,
    phone: c.phone,
    github: c.github,
    linkedin: c.linkedin,
    display: { email: c.email, phone: c.phone, github: strip(c.github), linkedin: strip(c.linkedin) },
  };
};
