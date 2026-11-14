// Draws the ninja profile picture: a small ninja developer at a laptop that carries Shipyard's mark,
// eyes closed in concentration, with a tick to say the build passed.
// Run: node scripts/avatar-ninja.mjs   (then rasterise avatar/avatar-ninja.svg to PNG)

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'avatar');

const OUTLINE = '#231942';
const OUTLINE_WIDTH = 11;
const SUIT = { base: '#46508A', shade: '#343C6B', light: '#6470B5', wrap: '#2A3157' };
const BAND = { base: '#FFB24D', shade: '#F0882B' };
const SKIN = { base: '#FFD8B8', shade: '#F2B894', blush: '#FF9C8F' };
const METAL = { base: '#E3E9F6', shade: '#B9C4DF', dark: '#8E9BBD' };
const GREEN = '#30C968';

const BACKGROUND = '#AEBBFF';
const GROUND = '#94A3F2';

const HEAD = 'M400 118C520 118 612 196 612 304C612 410 520 482 400 482C280 482 188 410 188 304C188 196 280 118 400 118Z';
const FACE = 'M300 262H500C530 262 548 290 544 328C540 362 518 380 488 380H312C282 380 260 362 256 328C252 290 270 262 300 262Z';
const LID = 'M294 528H506A16 16 0 0 1 522 544V662H278V544A16 16 0 0 1 294 528Z';
const TORSO = 'M286 470C286 438 342 428 400 428C458 428 514 438 514 470L536 640C536 668 264 668 264 640Z';
const ARM = 'M304 478C250 486 228 540 244 592C252 616 284 624 302 610C318 598 320 560 324 520Z';
const LEG = 'M164 652C164 600 228 578 302 590C366 600 404 632 404 666C404 702 342 714 268 710C206 706 164 692 164 652Z';

const stroke = `stroke="${OUTLINE}" stroke-width="${OUTLINE_WIDTH}" stroke-linejoin="round" stroke-linecap="round"`;
const mirror = (inner) => `<g transform="translate(800 0) scale(-1 1)">${inner}</g>`;

function draw() {
  const leg = `<path d="${LEG}" fill="${SUIT.base}" ${stroke}/><path d="M186 676C230 700 320 704 392 684" fill="none" stroke="${SUIT.shade}" stroke-width="14" stroke-linecap="round" opacity=".9"/>`;
  const arm = `<path d="${ARM}" fill="${SUIT.base}" ${stroke}/><path d="M256 590C264 604 284 610 298 600" fill="none" stroke="${SUIT.shade}" stroke-width="12" stroke-linecap="round"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800" role="img" aria-label="A small cartoon ninja with an amber headband, typing at a laptop">
<defs>
  <clipPath id="head"><path d="${HEAD}"/></clipPath>
  <clipPath id="face"><path d="${FACE}"/></clipPath>
  <clipPath id="lid"><path d="${LID}"/></clipPath>
  <linearGradient id="sail" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB24D"/><stop offset="1" stop-color="#FF5A3C"/></linearGradient>
</defs>
<rect width="800" height="800" fill="${BACKGROUND}"/>
<ellipse cx="400" cy="712" rx="262" ry="26" fill="${GROUND}"/>

<!-- the headband's tails, flying behind the head -->
<g fill="${BAND.base}" ${stroke}>
  <path d="M600 262C646 232 700 236 728 262C692 264 660 274 624 288Z"/>
  <path d="M604 276C650 284 694 306 706 344C670 328 640 314 610 304Z"/>
</g>
<path d="M640 252C664 246 690 250 706 258" fill="none" stroke="#FFD08A" stroke-width="7" stroke-linecap="round"/>

<!-- body -->
${leg}${mirror(leg)}
<g fill="${SUIT.wrap}" ${stroke}><ellipse cx="338" cy="700" rx="40" ry="20"/><ellipse cx="462" cy="700" rx="40" ry="20"/></g>
<path d="${TORSO}" fill="${SUIT.base}" ${stroke}/>
<path d="M352 470L400 520L448 470" fill="none" ${stroke}/>
${arm}${mirror(arm)}

<!-- laptop, seen from behind -->
<rect x="258" y="654" width="284" height="26" rx="11" fill="${METAL.dark}" ${stroke}/>
<path d="${LID}" fill="${METAL.base}" ${stroke}/>
<g clip-path="url(#lid)">
  <path d="M278 630H522V662H278Z" fill="${METAL.shade}"/>
  <path d="M300 546L340 546L300 610Z" fill="#fff" opacity=".7"/>
</g>
<path d="${LID}" fill="none" ${stroke}/>
<g transform="translate(366 556)">
  <path d="M34 0L62 44H34Z" fill="url(#sail)"/><path d="M27 14V44H6Z" fill="#FFCB8A"/>
  <rect x="0" y="52" width="68" height="18" rx="9" fill="${OUTLINE}"/><circle cx="55" cy="61" r="5" fill="${GREEN}"/>
</g>

<!-- head: a hood with an opening for the eyes -->
<path d="${HEAD}" fill="${SUIT.base}"/>
<g clip-path="url(#head)">
  <path d="M188 304C188 410 280 482 400 482C520 482 612 410 612 304C590 398 500 436 400 436C300 436 210 398 188 304Z" fill="${SUIT.shade}"/>
  <path d="M246 214C268 172 308 148 352 140" fill="none" stroke="${SUIT.light}" stroke-width="16" stroke-linecap="round"/>
</g>
<path d="${FACE}" fill="${SKIN.base}"/>
<g clip-path="url(#face)">
  <path d="M240 262H560V300Q400 282 240 300Z" fill="${SKIN.shade}" transform="translate(0 6)"/>
  <ellipse cx="292" cy="358" rx="24" ry="13" fill="${SKIN.blush}" opacity=".75"/><ellipse cx="508" cy="358" rx="24" ry="13" fill="${SKIN.blush}" opacity=".75"/>
</g>
<path d="${FACE}" fill="none" ${stroke}/>
<path d="M310 330Q336 352 362 330M438 330Q464 352 490 330" fill="none" ${stroke}/>

<!-- headband -->
<g clip-path="url(#head)">
  <path d="M150 262Q400 190 650 262V318Q400 246 150 318Z" fill="${BAND.base}"/>
  <path d="M150 300Q400 228 650 300V318Q400 246 150 318Z" fill="${BAND.shade}"/>
  <path d="M150 262Q400 190 650 262M150 318Q400 246 650 318" fill="none" ${stroke}/>
</g>
<path d="${HEAD}" fill="none" ${stroke}/>
<circle cx="606" cy="276" r="21" fill="${BAND.base}" ${stroke}/>

<!-- the build passed -->
<g>
  <path d="M232 200L262 232L214 216Z" fill="#fff" ${stroke}/>
  <circle cx="196" cy="166" r="48" fill="#fff" ${stroke}/>
  <path d="M226 196L250 222L214 210Z" fill="#fff"/>
  <path d="M174 168L190 184L220 150" fill="none" stroke="${GREEN}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
</g>
</svg>`;
}

const svg = draw();
writeFileSync(join(dir, 'avatar-ninja.svg'), svg);
console.log(`avatar-ninja.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
