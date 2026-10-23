import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';

/**aebriam only
 * Guided tour: a fake cursor with a chat bubble glides to the important parts
 * of the page and "types" a short message at each stop.
 * Runs once on the first visit; afterwards a "take the tour again" pill replays it.
 */
type Anchor = 'tl' | 'center' | 'left';
type Step = { target: string; text: string; anchor?: Anchor; click?: boolean; hops?: string[]; hopsMs?: number };

const SEEN_KEY = 'tour-seen-v2';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Resolves once the page has stopped scrolling (smooth scroll has no "done" event everywhere). */
const scrollSettled = async () => {
  let last = -1;
  let still = 0;
  for (let i = 0; i < 60; i++) {
    await wait(50);
    const y = window.scrollY;
    if (y === last) {
      if (++still >= 3) return;
    } else {
      still = 0;
      last = y;
    }
  }
};

/** Point on the element in PAGE coordinates, so the cursor stays put when the visitor scrolls. */
const pointFor = (el: HTMLElement, anchor: Anchor = 'center') => {
  const box = el.getBoundingClientRect();
  const sx = window.scrollX;
  const sy = window.scrollY;
  if (anchor === 'tl') return { x: box.left + sx - 4, y: box.top + sy + 2 };
  if (anchor === 'left') return { x: box.left + sx - 8, y: box.top + sy + box.height / 2 };
  return { x: box.left + sx + box.width / 2, y: box.top + sy + box.height / 2 };
};

const Tour = () => {
  const { pathname } = useLocation();
  const { content } = useContent();
  const first = content.profile.shortName;

  const steps: Step[] = [
    { target: '#about .hero-name', text: `Hi, I'm ${first}. I like to build new things!!`, anchor: 'tl' },
    // one bubble, then the cursor taps each link; the whole socials part takes 1.5 s
    {
      target: '[data-tour="resume"]', text: 'My Socials', anchor: 'center', hopsMs: 1500,
      hops: ['[data-tour="github"]', '[data-tour="facebook"]', '[data-tour="email"]'],
    },
    { target: '#about .facts', text: 'Here are some quick facts about me', anchor: 'tl' },
    { target: '#projects .fan-item.is-active .pcard', text: 'Here are some of my projects. Each has a live DEMO.', anchor: 'tl' },
    { target: '#experience .tl-item', text: 'Work experience.', anchor: 'tl' },
    { target: '#contact .card', text: 'Here is my Contacts.', anchor: 'tl' },
  ];

  const pointerRef = useRef<HTMLDivElement>(null);
  const cancelled = useRef(false);
  const userScrolled = useRef(false); // visitor scrolled during the tour -> stop auto-scrolling
  const currentRef = useRef<{ el: HTMLElement; anchor?: Anchor } | null>(null);

  const place = (x: number, y: number) => {
    const pointer = pointerRef.current;
    if (!pointer) return;
    const maxX = document.documentElement.clientWidth - 24;
    setFlip(x > document.documentElement.clientWidth - 280); // bubble goes left near the right edge
    pointer.style.transform = `translate(${Math.min(x, maxX)}px, ${y}px)`;
  };
  const [running, setRunning] = useState(false);
  const [typed, setTyped] = useState('');
  const [flip, setFlip] = useState(false);
  const [clicking, setClicking] = useState(false);

  const finish = useCallback(() => {
    cancelled.current = true;
    setRunning(false);
    setTyped('');
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const typeOut = async (text: string) => {
    const chars = Array.from(text); // keeps emoji intact
    for (let i = 1; i <= chars.length; i++) {
      if (cancelled.current) return;
      setTyped(chars.slice(0, i).join(''));
      await wait(28);
    }
  };

  const run = useCallback(async () => {
    const pointer = pointerRef.current;
    if (!pointer) return;
    cancelled.current = false;
    userScrolled.current = false;
    setTyped('');
    setRunning(true);
    // show every scroll-revealed section now so measurements are final
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await scrollSettled();
    // enter from the bottom-right corner of the screen
    pointer.style.transition = 'none';
    place(document.documentElement.clientWidth - 60, window.scrollY + window.innerHeight - 70);
    void pointer.offsetWidth; // apply the start position before animating
    pointer.style.transition = '';
    await wait(150);

    for (const s of steps) {
      if (cancelled.current) return;
      const el = document.querySelector<HTMLElement>(s.target);
      if (!el) continue;

      setTyped('');
      // only steer the page while the visitor hasn't taken over scrolling
      if (!userScrolled.current) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await scrollSettled();
      }
      if (cancelled.current) return;

      currentRef.current = { el, anchor: s.anchor };
      const { x, y } = pointFor(el, s.anchor);
      const hopMs = s.hops && s.hops.length ? Math.round((s.hopsMs ?? 1500) / (s.hops.length + 1)) : 0;
      if (hopMs && pointerRef.current) pointerRef.current.style.transitionDuration = `${hopMs - 40}ms`;
      place(x, y);
      await wait(hopMs || 1000); // let the cursor arrive
      if (cancelled.current) return;

      if (s.click) {
        setClicking(true);
        el.click();
        await wait(250);
        setClicking(false);
      }
      if (s.hops && s.hops.length) {
        // quick pass over a row of links: bubble stays, cursor hops (total = hopsMs)
        const pointer = pointerRef.current;
        const per = hopMs;
        setTyped(s.text);
        for (const sel of s.hops) {
          if (cancelled.current) break;
          const h = document.querySelector<HTMLElement>(sel);
          if (!h) continue;
          currentRef.current = { el: h, anchor: s.anchor };
          const pt = pointFor(h, s.anchor);
          place(pt.x, pt.y);
          await wait(per);
        }
        if (pointer) pointer.style.transitionDuration = '';
        continue;
      }
      await typeOut(s.text);
      await wait(1700);
    }
    currentRef.current = null;
    if (!cancelled.current) {
      setTyped('');
      await wait(300);
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finish, first]);

  // first visit on the home page → start automatically
  useEffect(() => {
    if (pathname !== '/') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      /* ignore */
    }
    if (seen || reduce) return;
    const t = setTimeout(run, 1200);
    return () => clearTimeout(t);
  }, [pathname, run]);

  // the moment the visitor scrolls by themselves, the tour stops scrolling for them
  useEffect(() => {
    if (!running) return;
    const takeOver = () => {
      userScrolled.current = true;
    };
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) takeOver();
    };
    window.addEventListener('wheel', takeOver, { passive: true });
    window.addEventListener('touchmove', takeOver, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', takeOver);
      window.removeEventListener('touchmove', takeOver);
      window.removeEventListener('keydown', onKey);
    };
  }, [running]);

  // Esc skips; leaving the page cancels
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && finish();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [running, finish]);
  useEffect(() => {
    if (!running) return;
    const onResize = () => {
      const cur = currentRef.current;
      const pointer = pointerRef.current;
      if (!cur || !pointer) return;
      pointer.style.transition = 'none';
      const { x, y } = pointFor(cur.el, cur.anchor);
      place(x, y);
      void pointer.offsetWidth;
      pointer.style.transition = '';
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  useEffect(() => () => void (cancelled.current = true), []);

  if (pathname !== '/') return null;

  return (
    <>
      <div ref={pointerRef} className={`tour-pointer${running ? ' on' : ''}${clicking ? ' click' : ''}`} aria-hidden="true">
        <svg className="tour-cursor" width="20" height="22" viewBox="0 0 20 22">
          <path d="M2 1.5 L2 18 L6.6 13.9 L9.6 20.4 L12.6 19 L9.7 12.7 L16 12.4 Z" />
        </svg>
        {typed && (
          <div className={`tour-bubble${flip ? ' flip' : ''}`}>
            <span className="tour-name">{first}</span>
            <span className="tour-msg">
              {typed}
              <span className="tour-caret" />
            </span>
          </div>
        )}
      </div>

      {/* screen-reader version of the bubble */}
      <div className="sr-only" role="status" aria-live="polite">{running ? typed : ''}</div>

      {running ? (
        <button type="button" className="tour-pill" onClick={finish}>Skip tour</button>
      ) : (
        <button type="button" className="tour-pill" onClick={run}>Take the tour again</button>
      )}
    </>
  );
};

export default Tour;
