import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { swarmBus } from './swarmBus';

/**
 * Swarm build (home page only): on the first visit the page starts blank and a
 * swarm of cursors draws it back — boxes with a crosshair, text with an I-beam,
 * lines with a pen. When a screen is done the swarm scrolls on by itself until the
 * whole page is built, then the cursors scatter and the guided tour arrow takes over.
 *
 * It never edits React's DOM: pieces are hidden with a data attribute and revealed
 * with clip-path, and all cursors / outlines live in their own layer on <body>.
 * Which elements get built is decided by RULES below (CSS selectors).
 */
type Kind = 'box' | 'img' | 'text' | 'line' | 'vline';
type Rule = { sel: string; kind: Kind; edge?: 'top' };

const RULES: Rule[] = [
  // sidebar (desktop)
  { sel: '.sidebar', kind: 'box' },
  { sel: '.sidebar .brand-name', kind: 'text' },
  { sel: '.sidebar a > .micro', kind: 'text' },
  { sel: '.sidebar .side-label', kind: 'text' },
  { sel: '.sidebar .nav-item', kind: 'text' },
  { sel: '.sidebar .mt-auto > *', kind: 'text' },
  // intro
  { sel: '.hero-photo .frame', kind: 'box' },
  { sel: '.hero-photo img', kind: 'img' },
  { sel: '.hero-kicker', kind: 'text' },
  { sel: '.hero-name', kind: 'text' },
  { sel: '#about p', kind: 'text' },
  { sel: '[data-tour="socials"] .btn', kind: 'box' },
  { sel: '[data-tour="socials"] .arrow-link', kind: 'text' },
  { sel: '.fact dt', kind: 'text' },
  { sel: '.fact .lead', kind: 'line' },
  { sel: '.fact dd', kind: 'text' },
  { sel: '.hl', kind: 'box' },
  { sel: '.hl .micro', kind: 'text' },
  { sel: '.hl li', kind: 'text' },
  // every section heading: pen-drawn rule, then the title
  { sel: '.sec-head', kind: 'line' },
  { sel: '.sec-title', kind: 'text' },
  { sel: '.sec-head > .arrow-link', kind: 'text' },
  // projects
  { sel: '.fan-item .pcard', kind: 'box' },
  { sel: '.fan-item.is-active .pcard-shot', kind: 'img' },
  { sel: '.fan-item.is-active .app-icon', kind: 'box' },
  { sel: '.fan-item.is-active .pcard-kind', kind: 'text' },
  { sel: '.fan-item.is-active .pcard-title', kind: 'text' },
  { sel: '.fan-item.is-active .pcard-sum', kind: 'text' },
  { sel: '.fan-item.is-active .pcard-tags', kind: 'text' },
  { sel: '.fan-item.is-active .pcard-actions .btn', kind: 'box' },
  { sel: '.fan-item.is-active .pcard-actions .arrow-link', kind: 'text' },
  { sel: '.fan-arrow', kind: 'text' },
  { sel: '.fan-count', kind: 'text' },
  { sel: '.gh-activity', kind: 'text' },
  // experience + education
  { sel: '.timeline', kind: 'vline' },
  { sel: '.tl-item', kind: 'box' },
  { sel: '.tl-title', kind: 'text' },
  { sel: '.tl-when', kind: 'text' },
  { sel: '.tl-item > div:not(.tl-head)', kind: 'text' },
  { sel: '.tl-item li', kind: 'text' },
  // certifications
  { sel: '.badge img', kind: 'img' },
  { sel: '.badge-title', kind: 'text' },
  { sel: '#certifications .micro', kind: 'text' },
  // toolkit + contact lists
  { sel: '.stack-row', kind: 'line' },
  { sel: '.stack-row .k', kind: 'text' },
  { sel: '.stack-row .v', kind: 'text' },
  { sel: '.contact-line', kind: 'text' },
  { sel: '#contact .card', kind: 'box' },
  { sel: '#contact .card .micro', kind: 'text' },
  { sel: '#contact .mail-big', kind: 'text' },
  { sel: '#contact .card .btn', kind: 'box' },
  { sel: '.list-row', kind: 'line' },
  { sel: '.list-row > *', kind: 'text' },
  // footer
  { sel: '.page > footer', kind: 'line', edge: 'top' },
  { sel: '.page > footer > *', kind: 'text' },
];

const SEEN_KEY = 'swarm-seen-v1';
const PEND = 'data-sw-pend';
const LABELS = ['react', 'typescript', 'laravel', 'expo', 'sqlite', 'python', 'git', 'arduino'];
const GLYPHS = `
  <svg class="g-arrow" width="20" height="22" viewBox="0 0 20 22"><path d="M2 1.5 L2 18 L6.6 13.9 L9.6 20.4 L12.6 19 L9.7 12.7 L16 12.4 Z"/></svg>
  <svg class="g-cross" width="16" height="16" viewBox="0 0 16 16"><path class="halo" d="M8 0.5 V15.5 M0.5 8 H15.5"/><path class="line" d="M8 0.5 V15.5 M0.5 8 H15.5"/></svg>
  <svg class="g-ibeam" width="9" height="18" viewBox="0 0 9 18"><path class="halo" d="M1 1 H8 M4.5 1 V17 M1 17 H8"/><path class="line" d="M1 1 H8 M4.5 1 V17 M1 17 H8"/></svg>
  <svg class="g-pen" width="18" height="20" viewBox="0 0 18 20"><path d="M1.2 1.2 L4.5 15 L8.2 11.8 L12 18.5 L14.6 17 L10.8 10.3 L15.6 9 Z"/><circle cx="7.6" cy="9.2" r="1.3"/></svg>`;

type Task = { el: HTMLElement; kind: Kind; edge?: 'top'; state: 0 | 1 | 2; parent: Task | null };
type Cur = { el: HTMLDivElement; x: number; y: number; hidden: boolean };
type Line = { top: number; bottom: number; left: number; right: number };

const ABORT = Symbol('swarm-abort');
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const pageRect = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height };
};
const inView = (el: Element) => {
  const r = el.getBoundingClientRect();
  // whole viewport, so the last bits of the page still count as on screen at maximum scroll
  return r.top < window.innerHeight - 8 && r.bottom > 0;
};
/** not drawn at this width, or a carousel card that is fully faded out */
const isGhost = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  if (r.width < 1 && r.height < 1) return true;
  const fan = el.closest<HTMLElement>('.fan-item');
  return !!fan && parseFloat(getComputedStyle(fan).opacity) < 0.05;
};
/** the text's line boxes, relative to the element's own top-left corner */
const lineBoxes = (el: HTMLElement): Line[] => {
  const box = el.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(el);
  const rects = [...range.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5).sort((a, b) => a.top - b.top || a.left - b.left);
  const lines: Line[] = [];
  for (const r of rects) {
    const mid = (r.top + r.bottom) / 2;
    const l = lines.find((x) => mid > x.top && mid < x.bottom);
    if (l) {
      l.left = Math.min(l.left, r.left);
      l.right = Math.max(l.right, r.right);
      l.top = Math.min(l.top, r.top);
      l.bottom = Math.max(l.bottom, r.bottom);
    } else lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
  }
  return lines.map((l) => ({ top: l.top - box.top, bottom: l.bottom - box.top, left: l.left - box.left, right: l.right - box.left }));
};
/** clip that shows every finished line plus the current line up to the caret */
const typedClip = (lines: Line[], w: number, d: number) => {
  const m = 4;
  let i = 0;
  let acc = 0;
  while (i < lines.length - 1 && acc + (lines[i].right - lines[i].left) < d) {
    acc += lines[i].right - lines[i].left;
    i++;
  }
  const l = lines[i];
  const x = Math.min(l.right, l.left + (d - acc));
  const top = i === 0 ? -m : l.top;
  const bot = l.bottom + m;
  return {
    clip: `polygon(${-m}px ${-m}px, ${w + m}px ${-m}px, ${w + m}px ${top}px, ${x}px ${top}px, ${x}px ${bot}px, ${-m}px ${bot}px)`,
    x,
    y: (l.top + l.bottom) / 2,
  };
};

function createSwarm(onMode: (building: boolean) => void) {
  let token = 0;
  let tasks: Task[] = [];
  let layer: HTMLDivElement | null = null;
  let scanTimer = 0;
  let readyFired = false;
  // the visitor scrolled by themselves: never scroll for them again during this build
  let userTook = false;
  const takeOver = () => {
    userTook = true;
    swarmBus.userScrolled = true;
  };
  const onKey = (e: KeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) takeOver();
  };
  const listen = (on: boolean) => {
    if (on) {
      window.addEventListener('wheel', takeOver, { passive: true });
      window.addEventListener('touchmove', takeOver, { passive: true });
      window.addEventListener('keydown', onKey);
    } else {
      window.removeEventListener('wheel', takeOver);
      window.removeEventListener('touchmove', takeOver);
      window.removeEventListener('keydown', onKey);
    }
  };

  const alive = (my: number) => {
    if (my !== token) throw ABORT;
  };
  const sleep = (ms: number, my: number) =>
    new Promise<void>((res, rej) => setTimeout(() => (my === token ? res() : rej(ABORT)), ms));
  const tween = (ms: number, fn: (p: number) => void, my: number) =>
    new Promise<void>((res, rej) => {
      const t0 = performance.now();
      const step = (now: number) => {
        if (my !== token) return rej(ABORT);
        const p = Math.min(1, (now - t0) / ms);
        fn(p);
        if (p < 1) requestAnimationFrame(step);
        else res();
      };
      requestAnimationFrame(step);
    });
  const mk = (cls: string) => {
    const d = document.createElement('div');
    d.className = cls;
    layer?.appendChild(d);
    return d;
  };

  /* ---------- cursors ---------- */
  const place = (c: Cur, x: number, y: number) => {
    c.x = x;
    c.y = y;
    c.el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const tool = (c: Cur, t: 'arrow' | 'cross' | 'ibeam' | 'pen') => (c.el.dataset.tool = t);
  const press = (c: Cur, down: boolean) => c.el.classList.toggle('down', down);
  const makeCursor = (label: string, x: number, y: number): Cur => {
    const el = mk('sw-cur') as HTMLDivElement;
    el.dataset.tool = 'arrow';
    el.innerHTML = `${GLYPHS}<span class="sw-tag">${label}</span>`;
    const c = { el, x, y, hidden: false };
    place(c, x, y);
    return c;
  };
  const moveTo = async (c: Cur, x: number, y: number, my: number, minMs = 240) => {
    const sx = c.x;
    const sy = c.y;
    const dx = x - sx;
    const dy = y - sy;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const ms = clamp(dist * 0.7, minMs, 650);
    const bend = (Math.random() - 0.5) * 0.25 * dist; // slight arc so paths feel hand-made
    const nx = -dy / dist;
    const ny = dx / dist;
    await tween(ms, (p) => {
      const e = easeInOut(p);
      const arc = Math.sin(Math.PI * e) * bend;
      place(c, sx + dx * e + nx * arc, sy + dy * e + ny * arc);
    }, my);
  };

  /* ---------- tasks ---------- */
  const settle = (t: Task) => {
    t.el.removeAttribute(PEND);
    t.el.style.clipPath = '';
    t.state = 2;
  };
  const scanDom = () => {
    const known = new Map(tasks.map((t) => [t.el, t]));
    let changed = false;
    for (const r of RULES) {
      document.querySelectorAll<HTMLElement>(r.sel).forEach((el) => {
        if (known.has(el)) return;
        const t: Task = { el, kind: r.kind, edge: r.edge, state: 0, parent: null };
        known.set(el, t);
        tasks.push(t);
        changed = true;
        if (isGhost(el)) t.state = 2;
        else el.setAttribute(PEND, '');
      });
    }
    const before = tasks.length;
    tasks = tasks.filter((t) => t.el.isConnected);
    if (!changed && before === tasks.length) return;
    tasks.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    const byEl = new Map(tasks.map((t) => [t.el, t]));
    for (const t of tasks) {
      t.parent = null;
      for (let p = t.el.parentElement; p; p = p.parentElement) {
        const pt = byEl.get(p);
        if (pt) {
          t.parent = pt;
          break;
        }
      }
    }
  };
  const open = (t: Task) => t.state === 0 && (!t.parent || t.parent.state === 2);
  /** what's on screen first; once the visitor scrolls on their own, the rest too (closest to the screen first) */
  const next = () => {
    const onScreen = tasks.find((t) => open(t) && inView(t.el));
    if (onScreen || !userTook) return onScreen;
    let best: Task | undefined;
    let bestGap = Infinity;
    for (const t of tasks) {
      if (!open(t)) continue;
      const r = t.el.getBoundingClientRect();
      const gap = r.top > window.innerHeight ? r.top - window.innerHeight : -r.bottom;
      if (gap < bestGap) {
        bestGap = gap;
        best = t;
      }
    }
    return best;
  };
  swarmBus.isPending = (el) => tasks.some((t) => t.state !== 2 && (t.el === el || el.contains(t.el) || t.el.contains(el)));

  const doBox = async (c: Cur, t: Task, my: number) => {
    const r = pageRect(t.el);
    await moveTo(c, r.x, r.y, my);
    tool(c, 'cross');
    press(c, true);
    const box = mk('sw-box');
    box.innerHTML = '<i></i><i></i><i></i><i></i><span class="sw-badge"></span>';
    const badge = box.lastChild as HTMLElement;
    await tween(clamp(260 + (r.w + r.h) * 0.4, 340, 850), (p) => {
      const e = easeOut(p);
      const w = r.w * e;
      const h = r.h * e;
      Object.assign(box.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${w}px`, height: `${h}px` });
      badge.textContent = `${Math.round(w)} × ${Math.round(h)}`;
      place(c, r.x + w, r.y + h);
    }, my);
    press(c, false);
    settle(t);
    t.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
    await sleep(120, my);
    box.style.opacity = '0';
    setTimeout(() => box.remove(), 320);
    tool(c, 'arrow');
  };

  const doImg = async (c: Cur, t: Task, my: number) => {
    const r = pageRect(t.el);
    await moveTo(c, r.x + r.w / 2, r.y + r.h / 2, my);
    press(c, true);
    await sleep(80, my);
    press(c, false);
    t.el.style.clipPath = 'inset(0 0 100% 0)';
    t.el.removeAttribute(PEND);
    await tween(480, (p) => (t.el.style.clipPath = `inset(0 0 ${100 - easeOut(p) * 100}% 0)`), my);
    settle(t);
  };

  const doLine = async (c: Cur, t: Task, my: number) => {
    const r = pageRect(t.el);
    const y = t.edge === 'top' ? r.y : r.y + r.h;
    await moveTo(c, r.x, y, my);
    tool(c, 'pen');
    press(c, true);
    t.el.style.clipPath = 'inset(-3px 100% -3px 0)';
    t.el.removeAttribute(PEND);
    await tween(clamp(r.w * 0.9, 200, 600), (p) => {
      const e = easeInOut(p);
      t.el.style.clipPath = `inset(-3px ${100 - e * 100}% -3px 0)`;
      place(c, r.x + r.w * e, y);
    }, my);
    press(c, false);
    settle(t);
    tool(c, 'arrow');
  };

  const doVline = async (c: Cur, t: Task, my: number) => {
    const r = pageRect(t.el);
    await moveTo(c, r.x + 3, r.y, my);
    tool(c, 'pen');
    press(c, true);
    t.el.style.clipPath = 'inset(0 0 100% 0)';
    t.el.removeAttribute(PEND);
    await tween(clamp(r.h * 0.5, 250, 700), (p) => {
      const e = easeInOut(p);
      t.el.style.clipPath = `inset(0 0 ${100 - e * 100}% 0)`;
      place(c, r.x + 3, r.y + r.h * e);
    }, my);
    press(c, false);
    settle(t);
    tool(c, 'arrow');
  };

  const doText = async (c: Cur, t: Task, my: number) => {
    const lines = lineBoxes(t.el);
    if (!lines.length) return settle(t);
    let r = pageRect(t.el);
    await moveTo(c, r.x + lines[0].left, r.y + (lines[0].top + lines[0].bottom) / 2, my);
    r = pageRect(t.el);
    tool(c, 'ibeam');
    press(c, true);
    await sleep(60, my);
    press(c, false);
    const frame = mk('sw-box ghost');
    Object.assign(frame.style, { left: `${r.x - 2}px`, top: `${r.y - 1}px`, width: `${r.w + 4}px`, height: `${r.h + 2}px` });
    const total = lines.reduce((s, l) => s + (l.right - l.left), 0);
    const chars = Math.max(1, (t.el.textContent ?? '').trim().length);
    t.el.style.clipPath = typedClip(lines, r.w, 0).clip;
    t.el.removeAttribute(PEND);
    // short labels type slowly, long paragraphs speed up
    await tween(clamp(chars * 28, 240, 950), (p) => {
      const typed = Math.round(easeInOut(p) * chars) / chars;
      const k = typedClip(lines, r.w, typed * total);
      t.el.style.clipPath = k.clip;
      place(c, r.x + k.x + 1, r.y + k.y);
    }, my);
    settle(t);
    frame.style.opacity = '0';
    setTimeout(() => frame.remove(), 320);
    tool(c, 'arrow');
  };
  const KINDS: Record<Kind, (c: Cur, t: Task, my: number) => Promise<void>> = {
    box: doBox, img: doImg, line: doLine, vline: doVline, text: doText,
  };

  const worker = async (c: Cur, my: number) => {
    let idle = 0;
    while (tasks.some((t) => t.state !== 2)) {
      alive(my);
      const t = next();
      if (!t) {
        // nothing on screen to build: rest, and step out of the way after a moment
        if (!c.hidden && ++idle > 18) {
          c.hidden = true;
          c.el.style.opacity = '0';
        }
        await sleep(120, my);
        continue;
      }
      idle = 0;
      t.state = 1;
      if (c.hidden) {
        // come back in from the bottom of the screen
        place(c, window.scrollX + window.innerWidth * (0.25 + Math.random() * 0.6), window.scrollY + window.innerHeight + 24);
        c.hidden = false;
        c.el.style.opacity = '1';
      }
      await KINDS[t.kind](c, t, my);
      settle(t);
      swarmBus.notify();
    }
  };

  /* ---------- lifecycle ---------- */
  const fireReady = () => {
    if (readyFired) return;
    readyFired = true;
    swarmBus.ready = true;
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event('swarm:ready'));
  };

  const finishAll = (notifyUi: boolean) => {
    window.clearInterval(scanTimer);
    listen(false);
    layer?.remove();
    layer = null;
    tasks.forEach(settle);
    swarmBus.running = false;
    swarmBus.notify();
    window.dispatchEvent(new Event('swarm:end'));
    if (notifyUi) onMode(false);
  };

  const build = async () => {
    const my = ++token;
    finishAll(false);
    tasks = [];
    readyFired = false;
    userTook = false;
    swarmBus.userScrolled = false;
    swarmBus.ready = false;
    swarmBus.running = true;
    listen(true);
    document.documentElement.classList.add('swarm-on'); // turns off the page's own fade-ins while the swarm owns the reveal
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    scanDom();
    layer = document.createElement('div');
    layer.className = 'sw-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    scanTimer = window.setInterval(() => scanDom(), 600); // picks up content that loads later (Credly, GitHub)
    onMode(true);
    window.dispatchEvent(new Event('swarm:start'));

    try {
      // 1. the swarm gathers around a small mark in the middle of the page and orbits
      const vw = window.innerWidth;
      const count = vw < 640 ? 5 : vw < 1024 ? 6 : 8;
      const pageBox = (document.querySelector('.page') ?? document.body).getBoundingClientRect();
      const cx = pageBox.left + pageBox.width / 2 + window.scrollX;
      const cy = window.scrollY + window.innerHeight * 0.42;
      const scale = Math.min(1, vw / 760);
      const mark = mk('sw-mark');
      mark.textContent = 'aebriam.build()';
      Object.assign(mark.style, { left: `${cx}px`, top: `${cy}px` });
      const crew = LABELS.slice(0, count).map((label, i) => {
        const a = (i / count) * Math.PI * 2;
        const c = makeCursor(label, cx + Math.cos(a) * 280 * scale, cy + Math.sin(a) * 170);
        c.el.style.opacity = '0';
        return { c, a };
      });
      requestAnimationFrame(() => crew.forEach(({ c }) => (c.el.style.opacity = '1')));
      await tween(1400, (p) => {
        const e = easeOut(Math.min(1, p * 1.6));
        crew.forEach(({ c, a }, i) => {
          const ang = a + p * Math.PI * 1.1;
          const rad = 240 - e * 150 + Math.sin(p * 9 + i) * 8;
          place(c, cx + Math.cos(ang) * rad * 1.15 * scale, cy + Math.sin(ang) * rad * 0.7);
        });
      }, my);
      mark.style.opacity = '0';
      setTimeout(() => mark.remove(), 400);

      // 2. one cursor drags a ruler guide to the content's left edge; the rest start building
      const lead = crew[0].c;
      const gx = pageRect(document.querySelector('#about') ?? document.body).x;
      let guide: HTMLDivElement | null = null;
      const dragGuide = async () => {
        const sx = window.scrollX + 2;
        await moveTo(lead, sx, window.scrollY + window.innerHeight * 0.3, my);
        press(lead, true);
        guide = mk('sw-guide') as HTMLDivElement;
        guide.style.height = `${document.documentElement.scrollHeight}px`;
        await tween(560, (p) => {
          const x = sx + (gx - sx) * easeInOut(p);
          guide!.style.left = `${x}px`;
          place(lead, x, lead.y);
        }, my);
        press(lead, false);
      };
      // the swarm doesn't wait for the visitor: once the screen is built it scrolls on to the next unbuilt part,
      // until the visitor scrolls by themselves; after that it keeps building wherever they are (and off-screen)
      const autoScroll = async () => {
        await sleep(300, my);
        while (tasks.some((t) => t.state !== 2)) {
          if (userTook) {
            if (guide) guide.style.opacity = '0';
          } else if (!tasks.some((t) => t.state === 1 || (t.state === 0 && inView(t.el)))) {
            if (guide) guide.style.opacity = '0';
            const target = tasks.find((t) => t.state === 0);
            if (target) {
              window.scrollTo({ top: pageRect(target.el).y - window.innerHeight * 0.15, behavior: 'smooth' });
              await sleep(700, my);
            }
          }
          await sleep(120, my);
        }
      };
      await Promise.all([
        ...crew.map(({ c }, i) => (i === 0 ? dragGuide().then(() => worker(c, my)) : worker(c, my))),
        autoScroll(),
      ]);

      // 3. everything built: the swarm scatters off-screen, then the tour arrow ("me") takes over
      await Promise.all(crew.map(({ c }) => {
        const a = Math.random() * Math.PI * 2;
        c.el.style.opacity = '0';
        return moveTo(c, c.x + Math.cos(a) * 400, c.y + Math.sin(a) * 300, my, 450);
      }));
      finishAll(true);
      fireReady();
    } catch (e) {
      if (e !== ABORT) throw e;
    }
  };

  return {
    build,
    /** "Skip animation": show the whole page now; the tour still runs */
    skip() {
      token++;
      finishAll(true);
      fireReady();
    },
    /** leaving the page */
    destroy() {
      token++;
      finishAll(false);
      document.documentElement.classList.remove('swarm-on');
    },
  };
}

const SwarmBuild = () => {
  const { pathname } = useLocation();
  const [building, setBuilding] = useState(false);
  const [tourRunning, setTourRunning] = useState(false);
  const swarm = useRef<ReturnType<typeof createSwarm> | null>(null);
  const home = pathname === '/';
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // layout effect: hides the page before the first paint, so it never flashes in fully built
  useLayoutEffect(() => {
    if (!home) return;
    const s = createSwarm(setBuilding);
    swarm.current = s;
    let seen = false;
    try {
      seen = localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      /* ignore */
    }
    if (!seen && !reduce) void s.build();
    return () => {
      s.destroy();
      swarm.current = null;
      setBuilding(false);
    };
  }, [home, reduce]);

  useEffect(() => {
    const onTour = (e: Event) => setTourRunning(!!(e as CustomEvent<{ running: boolean }>).detail?.running);
    window.addEventListener('tour:state', onTour);
    return () => window.removeEventListener('tour:state', onTour);
  }, []);

  // Esc skips the build
  useEffect(() => {
    if (!building) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && swarm.current?.skip();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [building]);

  if (!home || reduce) return null;
  if (building)
    return <button type="button" className="tour-pill" onClick={() => swarm.current?.skip()}>Skip animation</button>;
  if (tourRunning) return null;
  return <button type="button" className="tour-pill" onClick={() => void swarm.current?.build()}>Replay build</button>;
};

export default SwarmBuild;
