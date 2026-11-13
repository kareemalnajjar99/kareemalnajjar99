// Draws the blueprint profile picture: the name's real font outline, part rendered, part still wireframe.
// Run: node scripts/avatar-blueprint.mjs   (then rasterise avatar/avatar-blueprint.svg to PNG)

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'avatar');
const outline = JSON.parse(readFileSync(join(dir, 'kareem-outline.json'), 'utf8'));

const SIZE = 800;
const CENTER = SIZE / 2;
const FONT_SIZE = 150;
const TRACKING = -4;
const BASE = 452;
const BUILT = 0.8;
const MONO = `'JetBrains Mono',ui-monospace,Menlo,monospace`;
const ORANGE = '#FF8A5C';

const k = FONT_SIZE / outline.unitsPerEm;
const wordWidth = outline.width * k + TRACKING * (outline.glyphs.length - 1);
const left = CENTER - wordWidth / 2;
const right = left + wordWidth;
const cap = BASE - outline.capHeight * k;
const xHeight = BASE - outline.xHeight * k;
const scanX = left + wordWidth * BUILT;
const r = (n) => Math.round(n * 10) / 10;

let path = '';
const anchors = [];
const handles = [];
outline.glyphs.forEach((glyph, index) => {
  const at = ([x, y]) => [r(left + (glyph.x + x) * k + index * TRACKING), r(BASE - y * k)];
  let current;
  for (const [op, points] of glyph.ops) {
    const p = points.map(at);
    if (op === 'moveTo') path += `M${p[0]}`;
    if (op === 'lineTo') path += `L${p[0]}`;
    if (op === 'curveTo') {
      path += `C${p[0]} ${p[1]} ${p[2]}`;
      handles.push([current, p[0]], [p[2], p[1]]);
    }
    if (op === 'closePath') path += 'Z';
    if (p.length) {
      current = p[p.length - 1];
      anchors.push(current);
    }
  }
});

const unbuilt = ([x]) => x > scanX + 6;
const handleSvg = handles
  .filter(([anchor, control]) => unbuilt(anchor) && unbuilt(control))
  .map(([a, c]) => `<path d="M${a}L${c}" stroke="${ORANGE}" stroke-width="1.3" stroke-opacity=".85"/><circle cx="${c[0]}" cy="${c[1]}" r="2.6" fill="${ORANGE}"/>`)
  .join('');
const anchorSvg = anchors
  .filter(unbuilt)
  .map(([x, y]) => `<rect x="${r(x - 3.2)}" y="${r(y - 3.2)}" width="6.4" height="6.4" fill="#0B0C12" stroke="#fff" stroke-width="1.6"/>`)
  .join('');

let ticks = '';
for (let deg = 0; deg < 360; deg += 3) {
  const length = deg % 45 === 0 ? 26 : deg % 15 === 0 ? 16 : 8;
  const opacity = deg % 45 === 0 ? 0.6 : deg % 15 === 0 ? 0.38 : 0.2;
  ticks += `<path d="M${CENTER} ${CENTER - 388}v${length}" transform="rotate(${deg} ${CENTER} ${CENTER})" stroke="#fff" stroke-opacity="${opacity}" stroke-width="2"/>`;
}

const guide = (y, label, labelDy) =>
  `<path d="M84 ${r(y)}H716" stroke="${ORANGE}" stroke-opacity=".8" stroke-width="2.2" stroke-dasharray="2 9" stroke-linecap="round"/>` +
  `<text x="716" y="${r(y + labelDy)}" text-anchor="end" font-family="${MONO}" font-size="19" font-weight="600" fill="${ORANGE}">${label}</text>`;

const crosshair = (y) =>
  `<g stroke="#fff" stroke-opacity=".5" stroke-width="2.2" fill="none"><circle cx="${CENTER}" cy="${y}" r="11"/><path d="M${CENTER - 22} ${y}h44M${CENTER} ${y - 22}v44"/></g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
<defs>
 <linearGradient id="brand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFA24A"/><stop offset=".5" stop-color="#FF5A3C"/><stop offset="1" stop-color="#FF3D8B"/></linearGradient>
 <linearGradient id="heat" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#FFC9A8"/><stop offset="1" stop-color="#FF7A45"/></linearGradient>
 <radialGradient id="a1"><stop offset="0" stop-color="#FF5A36" stop-opacity=".55"/><stop offset="1" stop-color="#FF5A36" stop-opacity="0"/></radialGradient>
 <radialGradient id="a2"><stop offset="0" stop-color="#5546FF" stop-opacity=".62"/><stop offset="1" stop-color="#5546FF" stop-opacity="0"/></radialGradient>
 <radialGradient id="a3"><stop offset="0" stop-color="#FF3D8B" stop-opacity=".4"/><stop offset="1" stop-color="#FF3D8B" stop-opacity="0"/></radialGradient>
 <radialGradient id="gridFade"><stop offset=".35" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".25"/></radialGradient>
 <mask id="gridMask"><rect width="${SIZE}" height="${SIZE}" fill="url(#gridFade)"/></mask>
 <pattern id="fine" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".08"/></pattern>
 <pattern id="major" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0H0V200" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1.5"/></pattern>
 <clipPath id="built"><rect width="${r(scanX)}" height="${SIZE}"/></clipPath>
 <clipPath id="word"><path d="${path}"/></clipPath>
 <filter id="bloom" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="16"/></filter>
 <filter id="beam" x="-600%" y="-10%" width="1300%" height="120%"><feGaussianBlur stdDeviation="7"/></filter>
</defs>

<rect width="${SIZE}" height="${SIZE}" fill="#07080C"/>
<circle cx="90" cy="760" r="520" fill="url(#a1)"/>
<circle cx="700" cy="120" r="480" fill="url(#a2)"/>
<circle cx="820" cy="780" r="360" fill="url(#a3)"/>
<g mask="url(#gridMask)"><rect width="${SIZE}" height="${SIZE}" fill="url(#fine)"/><rect width="${SIZE}" height="${SIZE}" fill="url(#major)"/></g>
${ticks}

${crosshair(172)}
<text x="${CENTER}" y="250" text-anchor="middle" font-family="${MONO}" font-size="20" font-weight="600" letter-spacing="5" fill="#fff" fill-opacity=".6">DWG NO. KA-006</text>

${guide(cap, 'cap', -9)}${guide(xHeight, 'x', -8)}${guide(BASE, 'base', 24)}
<g stroke="#fff" stroke-opacity=".65" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round">
 <path d="M98 ${r(cap)}V${BASE}"/><path d="M90 ${r(cap + 10)}l8-10 8 10M90 ${BASE - 10}l8 10 8-10"/>
 <path d="M${r(left)} ${BASE + 60}H${r(right)}"/><path d="M${r(left + 10)} ${BASE + 52}l-10 8 10 8M${r(right - 10)} ${BASE + 52}l10 8-10 8"/>
 <path d="M${r(left)} ${BASE + 44}v32M${r(right)} ${BASE + 44}v32" stroke-opacity=".4"/>
</g>
<text x="${CENTER}" y="${BASE + 102}" text-anchor="middle" font-family="${MONO}" font-size="23" font-weight="600" letter-spacing="6" fill="#fff" fill-opacity=".72">6 YRS · iOS</text>
${crosshair(628)}

<path d="${path}" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".95" stroke-width="2.2"/>
<g clip-path="url(#built)">
 <path d="${path}" fill="#FF7A45" fill-opacity=".55" filter="url(#bloom)"/>
 <path d="${path}" fill="#fff"/>
 <rect x="${r(scanX - 64)}" y="${r(cap - 20)}" width="64" height="${r(BASE - cap + 60)}" fill="url(#heat)" clip-path="url(#word)"/>
</g>
${handleSvg}
${anchorSvg}

<rect x="${r(scanX - 5)}" y="${r(cap - 44)}" width="10" height="${r(BASE - cap + 74)}" rx="5" fill="#FF6A3D" filter="url(#beam)"/>
<rect x="${r(scanX - 1.75)}" y="${r(cap - 44)}" width="3.5" height="${r(BASE - cap + 74)}" rx="1.75" fill="url(#brand)"/>
<path d="M${r(scanX - 9)} ${r(cap - 58)}h18l-9 13z" fill="#FFA24A"/>
<text x="${r(scanX + 16)}" y="${r(cap - 46)}" font-family="${MONO}" font-size="19" font-weight="700" fill="#FFA24A">${Math.round(BUILT * 100)}%</text>
</svg>
`;

writeFileSync(join(dir, 'avatar-blueprint.svg'), svg);
console.log(`scan line at x=${r(scanX)}, word ${r(left)}..${r(right)}, cap ${r(cap)}, x-height ${r(xHeight)}`);
