import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import ThemeSwitch from './ThemeSwitch';

export const NAV = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'stack', label: 'Toolkit' },
  { id: 'contact', label: 'Contact' },
];

/** Tracks which home-page section is on screen. */
const useActiveSection = (enabled: boolean) => {
  const [active, setActive] = useState('about');
  useEffect(() => {
    if (!enabled) return;
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [enabled]);
  return active;
};

const Sidebar = () => {
  const { content } = useContent();
  const { profile, contact } = content;
  const location = useLocation();
  const navigate = useNavigate();
  const onHome = location.pathname === '/';
  const active = useActiveSection(onHome);
  const [open, setOpen] = useState(false);

  // close the mobile menu on Escape / route change
  useEffect(() => setOpen(false), [location.pathname, location.hash]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    if (onHome) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    else navigate(`/#${id}`);
  };

  const links = (
    <nav aria-label="Sections" className="flex flex-col">
      {NAV.map((n) => {
        const isActive = onHome && active === n.id;
        return (
          <button key={n.id} type="button" className={`nav-item${isActive ? ' active' : ''}`} onClick={() => go(n.id)} aria-current={isActive ? 'true' : undefined}>
            {n.label}
          </button>
        );
      })}
    </nav>
  );

  const external = (
    <div className="flex flex-col">
      {profile.resumeUrl && (
        <a className="nav-item" href={profile.resumeUrl} target="_blank" rel="noreferrer">Resume ↗</a>
      )}
      {contact.github && (
        <a className="nav-item" href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</a>
      )}
      {contact.linkedin && (
        <a className="nav-item" href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
      )}
      {contact.facebook && (
        <a className="nav-item" href={contact.facebook} target="_blank" rel="noreferrer">Facebook ↗</a>
      )}
      {contact.email && (
        <a className="nav-item" href={`mailto:${contact.email}`}>Email ↗</a>
      )}
    </div>
  );

  return (
    <>
      {/* desktop: fixed left sidebar */}
      <aside className="sidebar">
        <Link to="/" className="block">
          <div className="brand-name">{profile.navName}</div>
          <div className="micro mt-1">{profile.roles[0] ?? 'Portfolio'}</div>
        </Link>
        <div className="side-group">
          <div className="side-label">Contents</div>
          {links}
        </div>
        <div className="side-group">
          <div className="side-label">Elsewhere</div>
          {external}
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <LocalClock />
          <ThemeSwitch />
        </div>
      </aside>

      {/* mobile: sticky top bar + full-screen menu */}
      <header className="topbar">
        <Link to="/" className="brand-name !text-[1.2rem]">{profile.navName}</Link>
        <button type="button" className="micro" onClick={() => setOpen(true)} aria-expanded={open} aria-label="Open menu">
          Menu
        </button>
      </header>

      {open && (
        <div className="overlay-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between">
            <span className="brand-name !text-[1.2rem]">{profile.navName}</span>
            <button type="button" className="micro" onClick={() => setOpen(false)} aria-label="Close menu">
              Close
            </button>
          </div>
          {links}
          <div className="side-group">{external}</div>
          <div className="mt-auto flex flex-col gap-4"><LocalClock /><ThemeSwitch /></div>
        </div>
      )}
    </>
  );
};

/** Live local time in Cebu — a small "this person is real" detail. */
const LocalClock = () => {
  const fmt = () =>
    new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Manila' }).format(new Date());
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const t = setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="clock">
      <span className="live-dot" aria-hidden="true" />
      <span>Cebu, PH · {time}</span>
    </div>
  );
};

export default Sidebar;
