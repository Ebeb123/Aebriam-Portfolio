// Runs before every build (npm run build / Vercel): draws the link-preview
// image (public/og-image.png) that Messenger, Facebook and LinkedIn show when
// someone shares your portfolio link.
//
// It uses your CURRENT profile photo (src/assets/profile1.png) and the name /
// status / tagline from src/content/siteContent.ts, so changing your photo or
// text updates the preview automatically on the next push.
// If anything goes wrong, the build keeps the previous image and continues.
import fs from 'node:fs';
import { readSiteMeta } from './site-meta.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root));
const out = new URL('public/og-image.png', root);

const pick = (src, re, fallback) => (src.match(re)?.[1] ?? fallback).replace(/\\'/g, "'");

try {
  const { default: satori } = await import('satori');
  const { Resvg } = await import('@resvg/resvg-js');

  const { name, status, tagline } = readSiteMeta();
  const html = read('index.html').toString();
  const site = pick(html, /<link rel="canonical" href="https?:\/\/([^"/]+)\/?"/, '');

  const photoBuf = read('src/assets/profile1.png');
  const isJpg = photoBuf[0] === 0xff && photoBuf[1] === 0xd8;
  const photo = `data:image/${isJpg ? 'jpeg' : 'png'};base64,${photoBuf.toString('base64')}`;

  const font = (pkg, file) => read(`node_modules/@fontsource/${pkg}/files/${file}`);
  const fonts = [
    { name: 'Plex', data: font('ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Plex', data: font('ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'Mono', data: font('ibm-plex-mono', 'ibm-plex-mono-latin-400-normal.woff'), weight: 400, style: 'normal' },
  ];

  // tiny h() helper so this file needs no JSX / React
  const h = (type, style, children) => ({ type, props: { style, children } });

  const tree = h('div', { width: 1200, height: 630, display: 'flex', background: '#f6f5f2', color: '#151515', fontFamily: 'Plex', padding: '80px 96px', position: 'relative' }, [
    h('div', { display: 'flex', flexDirection: 'column', width: 620 }, [
      status
        ? h('div', { display: 'flex', alignItems: 'center', fontFamily: 'Mono', fontSize: 22, color: '#1f4fd8' }, [
            h('div', { width: 10, height: 10, borderRadius: 5, background: '#1f4fd8', marginRight: 12 }, ''),
            status,
          ])
        : h('div', {}, ''),
      h('div', { fontSize: name.length > 18 ? 64 : 72, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1.05, marginTop: 28 }, name),
      tagline ? h('div', { fontSize: 30, color: '#4a4946', lineHeight: 1.4, marginTop: 24 }, tagline) : h('div', {}, ''),
      site
        ? h('div', { position: 'absolute', left: 0, top: 430, width: 600, borderTop: '2px solid #151515', paddingTop: 18, fontFamily: 'Mono', fontSize: 24, color: '#62605b' }, site)
        : h('div', {}, ''),
    ]),
    h('div', { position: 'absolute', right: 96, top: 80, width: 340, height: 470, borderRadius: 10, overflow: 'hidden', display: 'flex', background: '#e8e6e1', boxShadow: '0 20px 50px -20px rgba(0,0,0,0.3)' }, [
      { type: 'img', props: { src: photo, width: 340, height: 495, style: { width: 340, height: 495, objectFit: 'cover', objectPosition: 'top' } } },
    ]),
  ]);

  const svg = await satori(tree, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  fs.writeFileSync(out, png);
  console.log(`[og] link preview updated (${Math.round(png.length / 1024)} KB) for ${name}`);
} catch (err) {
  console.warn(`[og] could not draw the link preview (${err.message}) — keeping the previous one`);
}
