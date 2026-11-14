// Generates every image the profile README uses, from profile.config.json.
// Run: node scripts/build.mjs
//
// GitHub strips CSS and JS from READMEs, so all styling and motion lives inside
// the SVG files themselves. They must stay self-contained: no external fonts,
// images or scripts, because GitHub serves them as sandboxed images.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(readFileSync(join(root, 'profile.config.json'), 'utf8'));
const out = join(root, 'assets');
mkdirSync(out, { recursive: true });

const SANS = `-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter','Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const MONO = `ui-monospace,'SF Mono',SFMono-Regular,Menlo,'JetBrains Mono',Consolas,monospace`;
const INK = '#08090D';
const MUTED = '#AEB5C4';
const BRAND = ['#FFA24A', '#FF5A3C', '#FF3D8B'];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Each glyph is drawn in a 52x52 box. Project icons are reused on the phone's
// home screen in the banner and on that project's card.
const ICONS = {
  lumen: {
    g: ['#B26BFF', '#FF4D8D'],
    glyph: `<path d="M26 8.5C27.6 19.4 32.6 24.4 43.5 26 32.6 27.6 27.6 32.6 26 43.5 24.4 32.6 19.4 27.6 8.5 26 19.4 24.4 24.4 19.4 26 8.5Z" fill="#fff"/><circle cx="40.5" cy="12" r="2.6" fill="#fff" fill-opacity=".85"/>`,
  },
  shipyard: {
    g: ['#1B2440', '#080A11'],
    glow: ['#FFA24A', '#FF5A3C'],
    glyph:
      `<defs><linearGradient id="ic-sail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB24D"/><stop offset="1" stop-color="#FF5A3C"/></linearGradient></defs>` +
      `<g transform="translate(8 9.9) scale(.0542) translate(-180 -216)">` +
      `<path d="M512 250V552H776Z" fill="url(#ic-sail)" stroke="url(#ic-sail)" stroke-width="36" stroke-linejoin="round"/>` +
      `<path d="M452 352V552H292Z" fill="#fff" stroke="#fff" stroke-width="36" stroke-linejoin="round"/>` +
      `<rect x="196" y="622" width="632" height="172" rx="86" fill="#fff"/>` +
      `<rect x="270" y="690" width="196" height="36" rx="18" fill="#0B0E18"/>` +
      `<circle cx="724" cy="708" r="52" fill="#0B0E18"/><circle cx="724" cy="708" r="38" fill="#30D158"/></g>`,
  },
  polyglot: {
    g: ['#2DD4BF', '#2563EB'],
    glyph: `<g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><circle cx="26" cy="26" r="14"/><ellipse cx="26" cy="26" rx="6" ry="14"/><path d="M12.5 26h27"/></g>`,
  },
  terminal: {
    g: ['#2B303C', '#0F1116'],
    glyph: `<g fill="none" stroke="#30D158" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 19l8 7-8 7"/><path d="M27 34h11"/></g>`,
  },
  brackets: {
    g: ['#6B9BFF', '#3A45D8'],
    glyph: `<g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18.5 17.5l-8.5 8.5 8.5 8.5"/><path d="M33.5 17.5l8.5 8.5-8.5 8.5"/><path d="M29 14l-6 24"/></g>`,
  },
  layers: {
    g: ['#FF6A9A', '#B620D0'],
    glyph: `<path d="M26 11l16 8.5-16 8.5-16-8.5z" fill="#fff"/><g fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 26.5l16 8.5 16-8.5"/><path d="M10 33.5l16 8.5 16-8.5" stroke-opacity=".65"/></g>`,
  },
  bolt: {
    g: ['#FFD84A', '#FF9500'],
    glyph: `<path d="M29.5 8L14 29.5h10L22 44l16-22H28z" fill="#fff"/>`,
  },
  db: {
    g: ['#3EE0A1', '#078A5E'],
    glyph: `<g fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><ellipse cx="26" cy="16" rx="13" ry="5"/><path d="M13 16v20c0 2.8 5.8 5 13 5s13-2.2 13-5V16"/><path d="M13 26c0 2.8 5.8 5 13 5s13-2.2 13-5"/></g>`,
  },
  plain1: { g: ['#3A3F4D', '#20232C'], glyph: `<circle cx="26" cy="26" r="10" fill="#fff" fill-opacity=".8"/>` },
  plain2: { g: ['#FF8A5C', '#E0421E'], glyph: `<rect x="15" y="15" width="22" height="22" rx="6" fill="#fff" fill-opacity=".9"/>` },
  plain3: { g: ['#7DD3FC', '#0284C7'], glyph: `<circle cx="26" cy="26" r="10" fill="none" stroke="#fff" stroke-width="3"/>` },
  plain4: { g: ['#3A3F4D', '#20232C'], glyph: `<path d="M26 15v22M15 26h22" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>` },
};

const iconDefs = (keys) =>
  `<linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
  [...new Set(keys)]
    .map(
      (k) =>
        `<linearGradient id="ic-${k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ICONS[k].g[0]}"/><stop offset="1" stop-color="${ICONS[k].g[1]}"/></linearGradient>`,
    )
    .join('');

const icon = (key, x, y, size, delay) => {
  const anim = delay == null ? '' : ` class="pop" style="animation-delay:${delay.toFixed(2)}s"`;
  return (
    `<g transform="translate(${x} ${y}) scale(${size / 52})"><g${anim}>` +
    `<rect width="52" height="52" rx="13" fill="url(#ic-${key})"/>` +
    `<rect width="52" height="52" rx="13" fill="url(#gloss)"/>` +
    `<rect x=".5" y=".5" width="51" height="51" rx="12.5" fill="none" stroke="#fff" stroke-opacity=".2"/>` +
    ICONS[key].glyph +
    `</g></g>`
  );
};

const baseCss = `
.sans{font-family:${SANS}}
.mono{font-family:${MONO}}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
.rise{animation:rise .8s cubic-bezier(.2,.7,.2,1) both}
@keyframes pop{0%{opacity:0;transform:scale(.4)}70%{opacity:1;transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
.pop{transform-box:fill-box;transform-origin:center;animation:pop .55s cubic-bezier(.2,.9,.3,1.2) both}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
.pulse{animation:pulse 2.2s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

function hero() {
  const W = 1280;
  const H = 440;
  const { firstName, lastName, eyebrow, tagline, chips, years } = cfg;

  let chipX = 72;
  const chipY = 356;
  const chipSvg = chips
    .map((c, i) => {
      const w = Math.round(c.length * 8.9 + 30);
      const s =
        `<g class="rise" style="animation-delay:${(0.5 + i * 0.05).toFixed(2)}s">` +
        `<rect x="${chipX}" y="${chipY}" width="${w}" height="34" rx="17" fill="#fff" fill-opacity=".06" stroke="#fff" stroke-opacity=".16"/>` +
        `<text x="${chipX + w / 2}" y="${chipY + 22.5}" text-anchor="middle" class="sans" font-size="15.5" font-weight="600" fill="#DDE1EA">${esc(c)}</text></g>`;
      chipX += w + 10;
      return s;
    })
    .join('');

  const eyebrowW = Math.round(eyebrow.length * 10.9 + 48);

  // Home screen: two widgets, then a 4-column icon grid.
  const cols = [22, 98, 174, 250];
  const rows = [236, 312, 388];
  const grid = [
    'lumen',
    'shipyard',
    'polyglot',
    'terminal',
    'brackets',
    'layers',
    'bolt',
    'db',
    'plain1',
    'plain2',
    'plain3',
    'plain4',
  ];
  const icons = grid
    .map((k, i) => icon(k, cols[i % 4], rows[Math.floor(i / 4)], 52, 1.0 + i * 0.06))
    .join('');

  // Decorative activity grid for now. Phase 2 replaces it with real
  // contribution data written by a scheduled GitHub Action.
  const shades = [
    ['#fff', 0.08],
    ['#7A2E18', 1],
    ['#C2441F', 1],
    ['#F4602F', 1],
    ['#FF9466', 1],
  ];
  let seed = 41;
  const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  let cells = '';
  for (let c = 0; c < 7; c++) {
    for (let r = 0; r < 7; r++) {
      const last = c === 6 && r === 6;
      const v = rand();
      const lvl = last ? 4 : v < 0.2 ? 0 : v < 0.45 ? 1 : v < 0.7 ? 2 : v < 0.9 ? 3 : 4;
      const [fill, op] = shades[lvl];
      cells +=
        `<g class="rise" style="animation-delay:${(1.0 + c * 0.06).toFixed(2)}s">` +
        `<rect${last ? ' class="pulse"' : ''} x="${184 + c * 16}" y="${94 + r * 16}" width="12" height="12" rx="3.2" fill="${fill}" fill-opacity="${op}"/></g>`;
    }
  }

  const islandTimes = `keyTimes="0;.22;.27;.70;.75;1" calcMode="spline" keySplines=".4 0 .2 1;.2 .9 .2 1;.4 0 .2 1;.2 .9 .2 1;.4 0 .2 1" dur="10s" repeatCount="indefinite"`;

  const phone = `
<g transform="translate(1040 300) rotate(6) translate(-162 -250)">
 <g class="float"><g class="phone-in">
  <rect x="-3" y="150" width="5" height="34" rx="2" fill="#2A2D36"/>
  <rect x="-3" y="204" width="5" height="58" rx="2" fill="#2A2D36"/>
  <rect x="322" y="196" width="5" height="84" rx="2" fill="#2A2D36"/>
  <rect width="324" height="660" rx="58" fill="#0D0E12" stroke="url(#bezel)" stroke-width="2.5"/>
  <g clip-path="url(#screen)">
   <rect x="12" y="12" width="300" height="636" fill="url(#wall)"/>
   <circle cx="70" cy="420" r="230" fill="url(#wallA)"/>
   <circle cx="300" cy="120" r="210" fill="url(#wallB)"/>

   <text x="34" y="45" class="sans" font-size="15.5" font-weight="700" fill="#fff">9:41</text>
   <rect x="268.5" y="33.5" width="24" height="12" rx="3.8" fill="none" stroke="#fff" stroke-opacity=".5"/>
   <rect x="270.5" y="35.5" width="16" height="8" rx="2.2" fill="#fff"/>
   <rect x="294" y="37.5" width="2" height="4" rx="1" fill="#fff" fill-opacity=".5"/>

   <rect x="114" y="24" width="96" height="30" rx="15" fill="#000">
    <animate attributeName="width" values="96;96;176;176;96;96" ${islandTimes}/>
    <animate attributeName="x" values="114;114;74;74;114;114" ${islandTimes}/>
   </rect>
   <g class="isl">
    <g class="isl-build">
     <circle class="spin" cx="92" cy="39" r="6.5" fill="none" stroke="#FF9F0A" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="27 14"/>
     <rect x="108" y="36.5" width="126" height="5" rx="2.5" fill="#fff" fill-opacity=".16"/>
     <rect class="isl-bar" x="108" y="36.5" width="126" height="5" rx="2.5" fill="#FF9F0A"/>
    </g>
    <g class="isl-done">
     <circle cx="92" cy="39" r="7.5" fill="#30D158"/>
     <path d="M88.4 39.2l2.6 2.6 4.8-5.2" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
     <rect x="108" y="36.5" width="126" height="5" rx="2.5" fill="#30D158"/>
    </g>
   </g>

   <g class="pop" style="animation-delay:.80s">
    <rect x="22" y="84" width="128" height="128" rx="28" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".14"/>
    <text x="37" y="161" class="sans" font-size="82" font-weight="800" letter-spacing="-3" fill="url(#brand)">${esc(years)}</text>
    <text x="94" y="131" class="mono" font-size="12" font-weight="700" letter-spacing="1.6" fill="#fff">YEARS</text>
    <text x="94" y="150" class="sans" font-size="16" font-weight="700" fill="#fff" fill-opacity=".72">of iOS</text>
    <text x="39" y="193" class="mono" font-size="10.5" letter-spacing="1.3" fill="#fff" fill-opacity=".55">SHIPPING APPS</text>
   </g>
   <g class="pop" style="animation-delay:.88s">
    <rect x="174" y="84" width="128" height="128" rx="28" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".14"/>
   </g>
   ${cells}
   ${icons}
   <path d="M12 12H190L60 648H12Z" fill="url(#sheen)"/>
  </g>
  <rect x="12" y="12" width="300" height="636" rx="46" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="1.5"/>
 </g></g>
</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(`${firstName} ${lastName}. ${tagline}`)}">
<title>${esc(`${firstName} ${lastName}`)}</title>
<defs>
 <clipPath id="frame"><rect width="${W}" height="${H}" rx="32"/></clipPath>
 <clipPath id="screen"><rect x="12" y="12" width="300" height="636" rx="46"/></clipPath>
 <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${BRAND[0]}"/><stop offset=".5" stop-color="${BRAND[1]}"/><stop offset="1" stop-color="${BRAND[2]}"/></linearGradient>
 <linearGradient id="bezel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8C92A4"/><stop offset=".35" stop-color="#3A3D49"/><stop offset="1" stop-color="#1B1D24"/></linearGradient>
 <linearGradient id="wall" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#141722"/><stop offset=".55" stop-color="#1E1430"/><stop offset="1" stop-color="#34131F"/></linearGradient>
 <linearGradient id="sheen" x1="0" y1="0" x2="1" y2=".4"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <radialGradient id="wallA"><stop offset="0" stop-color="#FF4D6D" stop-opacity=".45"/><stop offset="1" stop-color="#FF4D6D" stop-opacity="0"/></radialGradient>
 <radialGradient id="wallB"><stop offset="0" stop-color="#5B5BFF" stop-opacity=".4"/><stop offset="1" stop-color="#5B5BFF" stop-opacity="0"/></radialGradient>
 <radialGradient id="a1"><stop offset="0" stop-color="#FF5A36" stop-opacity=".5"/><stop offset="1" stop-color="#FF5A36" stop-opacity="0"/></radialGradient>
 <radialGradient id="a2"><stop offset="0" stop-color="#FF2D78" stop-opacity=".3"/><stop offset="1" stop-color="#FF2D78" stop-opacity="0"/></radialGradient>
 <radialGradient id="a3"><stop offset="0" stop-color="#5546FF" stop-opacity=".6"/><stop offset="1" stop-color="#5546FF" stop-opacity="0"/></radialGradient>
 <radialGradient id="a4"><stop offset="0" stop-color="#FF3D8B" stop-opacity=".45"/><stop offset="1" stop-color="#FF3D8B" stop-opacity="0"/></radialGradient>
 <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.2" fill="#fff" fill-opacity=".16"/></pattern>
 <linearGradient id="dotFade" x1="0" y1="0" x2="1" y2="0"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
 <mask id="dotMask"><rect width="${W}" height="${H}" fill="url(#dotFade)"/></mask>
 ${iconDefs(grid)}
</defs>
<style>${baseCss}
@keyframes d1{0%,100%{transform:translate(0,0)}50%{transform:translate(70px,-40px)}}
@keyframes d2{0%,100%{transform:translate(0,0)}50%{transform:translate(-90px,50px)}}
@keyframes d3{0%,100%{transform:translate(0,0)}50%{transform:translate(-50px,-30px)}}
.d1{animation:d1 16s ease-in-out infinite}
.d2{animation:d2 20s ease-in-out infinite}
.d3{animation:d3 14s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
.float{animation:float 7s ease-in-out infinite}
@keyframes phoneIn{from{opacity:0;transform:translateY(80px)}to{opacity:1;transform:translateY(0)}}
.phone-in{animation:phoneIn 1.1s cubic-bezier(.16,.84,.24,1) .15s both}
@keyframes isl{0%,27%{opacity:0}30%,67%{opacity:1}70%,100%{opacity:0}}
@keyframes islBuild{0%,49%{opacity:1}51%,100%{opacity:0}}
@keyframes islDone{0%,49%{opacity:0}51%,100%{opacity:1}}
@keyframes islBar{0%,29%{transform:scaleX(.04)}49%,100%{transform:scaleX(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
.isl{animation:isl 10s linear infinite}
.isl-build{animation:islBuild 10s linear infinite}
.isl-done{animation:islDone 10s linear infinite}
.isl-bar{transform-box:fill-box;transform-origin:left center;animation:islBar 10s linear infinite}
.spin{transform-box:fill-box;transform-origin:center;animation:spin 1s linear infinite}
</style>
<g clip-path="url(#frame)">
 <rect width="${W}" height="${H}" fill="${INK}"/>
 <circle class="d1" cx="110" cy="500" r="430" fill="url(#a1)"/>
 <circle class="d2" cx="620" cy="-170" r="400" fill="url(#a2)"/>
 <circle class="d3" cx="1040" cy="260" r="400" fill="url(#a3)"/>
 <circle class="d1" cx="1290" cy="470" r="280" fill="url(#a4)"/>
 <rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#dotMask)"/>

 <g class="rise" style="animation-delay:.05s">
  <rect x="72" y="58" width="${eyebrowW}" height="34" rx="17" fill="#fff" fill-opacity=".06" stroke="#fff" stroke-opacity=".18"/>
  <circle class="pulse" cx="91" cy="75" r="4.5" fill="${BRAND[1]}"/>
  <text x="106" y="80" class="mono" font-size="14" font-weight="600" letter-spacing="2.4" fill="#DDE1EA">${esc(eyebrow)}</text>
 </g>
 <text class="sans rise" style="animation-delay:.15s" x="68" y="182" font-size="92" font-weight="800" letter-spacing="-3.2" fill="#fff">${esc(firstName)}</text>
 <text class="sans rise" style="animation-delay:.25s" x="68" y="272" font-size="92" font-weight="800" letter-spacing="-3.2" fill="url(#brand)">${esc(lastName)}</text>
 <text class="sans rise" style="animation-delay:.38s" x="72" y="324" font-size="23" font-weight="500" fill="${MUTED}">${esc(tagline)}</text>
 ${chipSvg}
 ${phone}
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="31.5" fill="none" stroke="#fff" stroke-opacity=".12"/>
</svg>
`;
}

function holoCard() {
  // Animated foil card: the illustration for the shader-effects project.
  return `
<g transform="translate(1010 150) rotate(7) translate(-150 -92)">
 <rect width="300" height="184" rx="22" fill="#fff" fill-opacity=".04" stroke="#fff" stroke-opacity=".14"/>
</g>
<g transform="translate(980 152) rotate(-8) translate(-150 -92)">
 <g clip-path="url(#holoClip)">
  <g transform="skewX(-24)"><rect class="foil" x="-400" y="0" width="1100" height="184" fill="url(#rainbow)"/></g>
  <rect width="300" height="184" fill="url(#holoShade)"/>
  <rect width="300" height="184" fill="url(#hatch)"/>
  <g transform="skewX(-24)"><rect class="shine" x="-140" y="0" width="70" height="184" fill="#fff" fill-opacity=".34"/></g>
  <rect x="24" y="26" width="46" height="34" rx="8" fill="#fff" fill-opacity=".9"/>
  <path d="M24 43h46M40 26v34M54 26v34" stroke="#0A0B0F" stroke-opacity=".28" stroke-width="1.5"/>
  <g fill="#fff" fill-opacity=".92">
   ${[0, 1, 2, 3]
     .map((g) => [0, 1, 2, 3].map((d) => `<circle cx="${30 + g * 64 + d * 11}" cy="112" r="3.4"/>`).join(''))
     .join('')}
  </g>
  <rect x="24" y="142" width="96" height="9" rx="4.5" fill="#fff" fill-opacity=".85"/>
  <rect x="232" y="138" width="44" height="18" rx="9" fill="#fff" fill-opacity=".5"/>
 </g>
 <rect x=".75" y=".75" width="298.5" height="182.5" rx="21.5" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>
</g>`;
}

function islandArt() {
  // A Live Activity following a run: four jobs fill in turn, then the run passes. One loop is 12 seconds.
  const jobs = ['Lint', 'Test', 'Build', 'Deploy'];
  const ends = [20, 40, 60, 78];
  const window = (from, to) => `0%,${from}%{opacity:0}${from + 1.5}%,${to}%{opacity:1}${to + 1.5}%,100%{opacity:0}`;

  const css = jobs
    .map((_, i) => {
      const from = i === 0 ? 0 : ends[i - 1];
      return (
        `@keyframes fill${i}{0%,${from}%{transform:scaleX(0)}${ends[i]}%,100%{transform:scaleX(1)}}` +
        `@keyframes pass${i}{0%,${ends[i]}%{opacity:0}${ends[i] + 1.5}%,100%{opacity:1}}` +
        `@keyframes job${i}{${i === 0 ? `0%,${ends[i]}%{opacity:1}${ends[i] + 1.5}%,100%{opacity:0}` : window(from, ends[i])}}` +
        `.fill${i}{transform-box:fill-box;transform-origin:left center;animation:fill${i} 12s linear infinite}` +
        `.pass${i}{animation:pass${i} 12s linear infinite}.job${i}{animation:job${i} 12s linear infinite}`
      );
    })
    .join('');

  const segments = jobs
    .map((_, i) => {
      const x = 28 + i * 83;
      return (
        `<rect x="${x}" y="104" width="75" height="7" rx="3.5" fill="#fff" fill-opacity=".14"/>` +
        `<rect class="fill${i}" x="${x}" y="104" width="75" height="7" rx="3.5" fill="#FF9F0A"/>` +
        `<rect class="pass${i}" x="${x}" y="104" width="75" height="7" rx="3.5" fill="#30D158"/>`
      );
    })
    .join('');

  const labels = jobs
    .map(
      (job, i) =>
        `<text class="sans job${i}" x="86" y="72" font-size="15" font-weight="500" fill="${MUTED}">${job} · job ${i + 1} of ${jobs.length}</text>`,
    )
    .join('');

  return {
    css:
      css +
      `@keyframes running{0%,78%{opacity:1}79.5%,100%{opacity:0}}@keyframes passed{0%,78%{opacity:0}79.5%,100%{opacity:1}}` +
      `.running{animation:running 12s linear infinite}.passed{animation:passed 12s linear infinite}` +
      `@keyframes spin{to{transform:rotate(360deg)}}.spin{transform-box:fill-box;transform-origin:center;animation:spin 1s linear infinite}`,
    svg: `
<g transform="translate(1000 150) rotate(6) scale(1.16) translate(-192 -70)">
 <rect width="384" height="140" rx="44" fill="#fff" fill-opacity=".04" stroke="#fff" stroke-opacity=".14"/>
</g>
<g transform="translate(978 152) rotate(-5) scale(1.16) translate(-192 -70)">
 <rect width="384" height="140" rx="44" fill="#000"/>
 <rect x=".75" y=".75" width="382.5" height="138.5" rx="43.25" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1.5"/>
 ${icon('shipyard', 28, 26, 46)}
 <text class="sans" x="86" y="48" font-size="19" font-weight="700" fill="#fff">Lumen <tspan class="mono" font-size="13" font-weight="500" fill="#fff" fill-opacity=".5" dx="4">main</tspan></text>
 ${labels}
 <text class="sans passed" x="86" y="72" font-size="15" font-weight="600" fill="#30D158">Passed in 1m 12s</text>
 <g class="running">
  <circle cx="338" cy="50" r="13" fill="none" stroke="#FF9F0A" stroke-opacity=".25" stroke-width="4"/>
  <circle class="spin" cx="338" cy="50" r="13" fill="none" stroke="#FF9F0A" stroke-width="4" stroke-linecap="round" stroke-dasharray="22 60"/>
 </g>
 <g class="passed">
  <circle cx="338" cy="50" r="15" fill="#30D158"/>
  <path d="M331 50.5l5 5 9-10" fill="none" stroke="#000" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
 </g>
 ${segments}
</g>`,
  };
}

/** The illustration on the right of a wide card, for the projects that have one. */
const ART = {
  lumen: () => ({ svg: holoCard(), css: '' }),
  shipyard: islandArt,
};

function card(p) {
  const wide = !!p.wide;
  const W = wide ? 1280 : 632;
  const H = wide ? 300 : 232;
  const pad = wide ? 40 : 32;
  const iconSize = wide ? 68 : 60;
  const [c1, c2] = ICONS[p.key].glow ?? ICONS[p.key].g;
  const art = wide && ART[p.key] ? ART[p.key]() : { svg: '', css: '' };
  const statusW = Math.round(p.status.length * 9.6 + 40);
  const statusX = pad + iconSize + 16;
  const statusY = pad + iconSize / 2 - 14;
  const live = p.status.startsWith('BUILDING');
  const lines = wide ? wrap(p.desc, 62) : [p.desc];
  const t = wide
    ? { title: 172, titleSize: 46, kicker: 201, kickerSize: 13.5, desc: 237, descSize: 19.5, lead: 27 }
    : { title: 140, titleSize: 34, kicker: 166, kickerSize: 12.5, desc: 198, descSize: 18, lead: 24 };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(`${p.title}: ${p.desc}`)}">
<title>${esc(p.title)}</title>
<defs>
 <clipPath id="frame"><rect width="${W}" height="${H}" rx="24"/></clipPath>
 <radialGradient id="glowA"><stop offset="0" stop-color="${c1}" stop-opacity=".42"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
 <radialGradient id="glowB"><stop offset="0" stop-color="${c2}" stop-opacity=".2"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>
 ${iconDefs([p.key])}
 ${
   wide
     ? `<clipPath id="holoClip"><rect width="300" height="184" rx="22"/></clipPath>
 <linearGradient id="rainbow" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="300" y2="0" spreadMethod="repeat"><stop offset="0" stop-color="#FF5F6D"/><stop offset=".2" stop-color="#FFC371"/><stop offset=".4" stop-color="#47E5BC"/><stop offset=".6" stop-color="#5B8CFF"/><stop offset=".8" stop-color="#B26BFF"/><stop offset="1" stop-color="#FF5F6D"/></linearGradient>
 <linearGradient id="holoShade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0B0F" stop-opacity=".5"/><stop offset=".6" stop-color="#0A0B0F" stop-opacity=".12"/><stop offset="1" stop-color="#0A0B0F" stop-opacity=".4"/></linearGradient>
 <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="1.2" height="7" fill="#fff" fill-opacity=".13"/></pattern>`
     : ''
 }
</defs>
<style>${baseCss}
@keyframes foil{from{transform:translateX(0)}to{transform:translateX(300px)}}
.foil{animation:foil 7s linear infinite}
@keyframes shine{0%,35%{transform:translateX(0)}75%,100%{transform:translateX(560px)}}
.shine{animation:shine 4.5s ease-in-out infinite}
${art.css}
</style>
<g clip-path="url(#frame)">
 <rect width="${W}" height="${H}" fill="${INK}"/>
 <circle cx="${W - 20}" cy="-20" r="${wide ? 560 : 360}" fill="url(#glowA)"/>
 <circle cx="0" cy="${H + 40}" r="${wide ? 420 : 300}" fill="url(#glowB)"/>
 ${art.svg}
 ${icon(p.key, pad, pad, iconSize)}
 <rect x="${statusX}" y="${statusY}" width="${statusW}" height="28" rx="14" fill="#fff" fill-opacity=".07" stroke="#fff" stroke-opacity=".16"/>
 <circle${live ? ' class="pulse"' : ''} cx="${statusX + 15}" cy="${statusY + 14}" r="4" fill="${live ? '#30D158' : '#8E96A8'}"/>
 <text x="${statusX + 27}" y="${statusY + 18.5}" class="mono" font-size="12" font-weight="600" letter-spacing="1.8" fill="#DDE1EA">${esc(p.status)}</text>
 <text x="${pad - 2}" y="${t.title}" class="sans" font-size="${t.titleSize}" font-weight="800" letter-spacing="-1" fill="#fff">${esc(p.title)}</text>
 <text x="${pad}" y="${t.kicker}" class="mono" font-size="${t.kickerSize}" font-weight="600" letter-spacing="1.9" fill="${c1}">${esc(p.kicker)}</text>
 ${lines
   .map(
     (l, i) =>
       `<text x="${pad}" y="${t.desc + i * t.lead}" class="sans" font-size="${t.descSize}" font-weight="500" fill="${MUTED}">${esc(l)}</text>`,
   )
   .join('\n ')}
 ${
   wide
     ? ''
     : `<path d="M${W - pad - 16} ${pad + 22}l14-14m-10 0h10v10" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`
 }
</g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="23.5" fill="none" stroke="#fff" stroke-opacity=".12"/>
</svg>
`;
}

function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const files = { 'hero.svg': hero() };
for (const p of cfg.projects) files[`card-${p.key}.svg`] = card(p);
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(out, name), svg);
  console.log(`${name.padEnd(22)} ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
}
