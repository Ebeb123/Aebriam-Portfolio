import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useContent } from '../contexts/ContentContext';
import Section, { fadeUp } from '../components/minimal/Section';
import ProjectCarousel from '../components/minimal/ProjectCarousel';
import { useCredlyBadges } from '../components/minimal/useCredlyBadges';

const Home = () => {
  const { content } = useContent();
  const { profile, about, experience, skills, contact } = content;
  const certifications = useCredlyBadges(content.certifications); // live from Credly
  const education = content.education ?? [];
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  // scroll to /#section when arriving from another page
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearTimeout(t);
  }, [location.hash]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  // name split into words; the last word is set in italics
  const words = profile.name.replace(/\s+[A-Z]\.\s+/, ' ').split(' ');

  // toolkit grouped by category (falls back to one group)
  const groups: { name: string; items: string[] }[] = [];
  for (const s of skills) {
    const g = s.group || 'Toolkit';
    const found = groups.find((x) => x.name === g);
    if (found) found.items.push(s.name);
    else groups.push({ name: g, items: [s.name] });
  }

  const issuerNames = [...new Set(certifications.map((c) => c.subtitle).filter(Boolean))];
  const issuers = issuerNames.length;
  // "{certCount}" / "{certIssuers}" in a highlight stay in sync with Credly
  const fillCerts = (text: string) =>
    text
      .replace('{certCount}', String(certifications.length))
      .replace('{certIssuers}', issuerNames.length > 1 ? `${issuerNames.slice(0, -1).join(', ')} & ${issuerNames[issuerNames.length - 1]}` : issuerNames[0] ?? '');

  return (
    <div className="page">
      {/* ---------- intro ---------- */}
      <header id="about">
        <div className="hero">
          <div style={fadeUp(0).style} className="fade-up hero-photo">
            <div className="frame">
              <img src={profile.photo} alt={profile.name} />
            </div>
            <div className="cap" aria-hidden="true">
              <span>{about.fields.find((f) => f.label === 'Base')?.value.split(',')[0] ?? ''}</span>
              <span>{about.fields.find((f) => f.label === 'Class')?.value ?? ''}</span>
            </div>
          </div>

          <div className="min-w-0">
            <div style={fadeUp(1).style} className="fade-up hero-kicker">
              <span className="live-dot" aria-hidden="true" />
              {about.status}
            </div>
            <h1 className="hero-name" aria-label={profile.name}>
              {words.map((w, i) => (
                <span key={i} className="w" aria-hidden="true">
                  <span style={{ animationDelay: `${150 + i * 110}ms` }}>
                    {i === words.length - 1 ? <em>{w}</em> : w}
                  </span>
                  {i < words.length - 1 ? ' ' : ''}
                </span>
              ))}
            </h1>
            <p style={fadeUp(3).style} className="fade-up hero-roles">{profile.roles.slice(0, 3).join('  /  ')}</p>
          </div>
        </div>

        <div style={fadeUp(4).style} className="fade-up mt-12 space-y-4 text-[16.5px] leading-[1.7] max-w-[36rem]">
          {about.paragraphs.map((p, i) => (
            <p key={i} className={i === 0 ? '' : 'muted'}>{p}</p>
          ))}
        </div>

        <div style={fadeUp(5).style} className="fade-up mt-6 flex flex-wrap items-center gap-x-6 gap-y-3" data-tour="socials">
          {profile.resumeUrl && (
            <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn" data-tour="resume">Resume ↗</a>
          )}
          {contact.github && (
            <a href={contact.github} target="_blank" rel="noreferrer" className="arrow-link lower" data-tour="github">GitHub <span className="arr">↗</span></a>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin} target="_blank" rel="noreferrer" className="arrow-link lower">LinkedIn <span className="arr">↗</span></a>
          )}
          {contact.facebook && (
            <a href={contact.facebook} target="_blank" rel="noreferrer" className="arrow-link lower" data-tour="facebook">Facebook <span className="arr">↗</span></a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="arrow-link lower" data-tour="email">Email <span className="arr">↗</span></a>
          )}
        </div>

        {about.fields.length > 0 && (
          <dl style={fadeUp(5).style} className="fade-up facts">
            {about.fields.map((f) => (
              <div key={f.label} className="fact">
                <dt>{f.label}</dt>
                <span className="lead" aria-hidden="true" />
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {about.highlights.length > 0 && (
          <div style={fadeUp(5).style} className="fade-up hl">
            <div className="micro mb-2">Highlights</div>
            <ul>
              {about.highlights.map((h, i) => (
                <li key={h}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <span>{fillCerts(h.charAt(0).toUpperCase() + h.slice(1))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* ---------- projects ---------- */}
      <Section
        id="projects"
        title="Selected work"
        action={<Link to="/projects" className="arrow-link">View all <span className="arr">→</span></Link>}
      >
        <ProjectCarousel />
      </Section>

      {/* ---------- experience ---------- */}
      {experience.length > 0 && (
        <Section id="experience" title="Experience">
          <div className="timeline">
            {experience.map((e, i) => (
              <div key={e.title + e.company} className={`tl-item${i === 0 ? ' now' : ''}`}>
                <div className="tl-head">
                  <span className="tl-title">{e.title}</span>
                  <span className="tl-when">{e.period.replace(' - ', ' – ')}</span>
                </div>
                <div className="text-[15px] muted">{e.company}</div>
                {e.description.length > 0 && (
                  <ul>
                    {e.description.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ---------- education ---------- */}
      {education.length > 0 && (
        <Section id="education" title="Education">
          <div className="timeline">
            {education.map((e, i) => (
              <div key={e.school + e.program} className={`tl-item${i === 0 ? ' now' : ''}`}>
                <div className="tl-head">
                  <span className="tl-title">{e.program}</span>
                  <span className="tl-when">{e.period.replace(' - ', ' – ')}</span>
                </div>
                <div className="text-[15px] muted">
                  {e.school}
                  {e.location ? `, ${e.location.split(',')[0]}` : ''}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ---------- certifications ---------- */}
      {certifications.length > 0 && (
        <Section id="certifications" title="Certifications" count={certifications.length}>
          <div className="badges">
            {certifications.map((c) =>
              c.credentialUrl ? (
                <a key={c.credentialUrl} href={c.credentialUrl} target="_blank" rel="noreferrer" className="badge" title={`${c.title} · ${c.subtitle}`}>
                  <img src={c.image} alt={`${c.title} badge, ${c.subtitle}`} loading="lazy" width={340} height={340} />
                  <span className="badge-title">{c.title}</span>
                </a>
              ) : (
                <div key={c.title} className="badge">
                  <img src={c.image} alt={`${c.title} badge, ${c.subtitle}`} loading="lazy" width={340} height={340} />
                  <span className="badge-title">{c.title}</span>
                </div>
              ),
            )}
          </div>
          <p className="micro mt-3">
            {certifications.length} credentials from {issuers} issuer{issuers === 1 ? '' : 's'}.
          </p>
        </Section>
      )}

      {/* ---------- toolkit ---------- */}
      {skills.length > 0 && (
        <Section id="stack" title="Toolkit">
          <div className="list">
            {groups.map((g) => (
              <div key={g.name} className="stack-row">
                <span className="k">{g.name}</span>
                <span className="v">{g.items.join(', ')}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ---------- contact ---------- */}
      <Section id="contact" title="Contact">
        <p className="contact-line max-w-[34rem]">{contact.tagline}</p>
        <div className="card mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="micro">Email</div>
            <a href={`mailto:${contact.email}`} className="mail-big">{contact.email}</a>
          </div>
          <button type="button" className="btn ghost shrink-0" onClick={copyEmail}>
            {copied ? 'Copied' : 'Copy address'}
          </button>
        </div>
        <div className="list mt-6">
          {contact.phone && (
            <div className="list-row"><span className="k">Phone</span><a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="link">{contact.phone}</a></div>
          )}
          {contact.github && (
            <div className="list-row"><span className="k">GitHub</span><a href={contact.github} target="_blank" rel="noreferrer" className="link">{contact.github.replace(/^https?:\/\/(www\.)?/, '')}</a></div>
          )}
          {contact.facebook && (
            <div className="list-row"><span className="k">Facebook</span><a href={contact.facebook} target="_blank" rel="noreferrer" className="link">{contact.facebook.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') || 'Facebook'}</a></div>
          )}
        </div>
      </Section>

      <footer className="mt-24 pt-6 border-t border-[rgb(var(--g200))] flex flex-wrap justify-between gap-2">
        <span className="micro">© {new Date().getFullYear()} {profile.name}</span>
        <a href="#about" className="micro hover:text-[rgb(var(--ink))]">Back to top ↑</a>
      </footer>
    </div>
  );
};

export default Home;
