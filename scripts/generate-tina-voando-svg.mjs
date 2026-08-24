#!/usr/bin/env node
// Desenha a Tina batendo asa em loop — pra ficar ao lado da Agatha no topo
// do README. Mesmo pixel art e mesma logica de tema escuro usadas na cena
// "Agatha cacando zumbis" (scripts/generate-zumbis-svg.mjs).

import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const BAT_BASE = [
  ['2/7/3/8', 'fur-body'], ['3/7/4/9', 'fur-body'], ['3/8/4/9', 'ear-inner'],
  ['2/14/3/15', 'fur-body'], ['3/13/4/15', 'fur-body'], ['3/13/4/14', 'ear-inner'],
  ['4/7/10/15', 'fur-body'], ['4/8/5/11', 'fur-hi'],
  ['6/8/8/10', 'bat-eye'], ['6/12/8/14', 'bat-eye'], ['7/9/8/10', 'pupil'], ['7/12/8/13', 'pupil'],
  ['8/10/9/12', 'nose'], ['10/9/14/13', 'fur-body'], ['11/10/14/12', 'belly'], ['12/10/13/11', 'marca'],
  ['9/9/10/13', 'mouth'], ['9/9/10/10', 'tooth'], ['9/12/10/13', 'tooth'],
  ['14/9/15/11', 'foot'], ['14/11/15/13', 'foot'],
];
const BAT_WING_UP = [
  ['6/7/10/9', 'wing'], ['4/5/10/7', 'wing'], ['3/3/9/5', 'wing'], ['3/2/7/3', 'wing-dark'],
  ['6/13/10/15', 'wing'], ['4/15/10/17', 'wing'], ['3/17/9/19', 'wing'], ['3/19/7/20', 'wing-dark'],
];
const BAT_WING_DOWN = [
  ['9/7/13/9', 'wing'], ['9/5/14/7', 'wing'], ['10/3/15/5', 'wing'], ['11/2/15/3', 'wing-dark'],
  ['9/13/13/15', 'wing'], ['9/15/14/17', 'wing'], ['10/17/15/19', 'wing'], ['11/19/15/20', 'wing-dark'],
];

const BAT_COLORS_SHARED = {
  'fur-hi': '#362c40', 'ear-inner': '#c86b7a', 'bat-eye': '#f4f1e8',
  pupil: '#ff3b21', nose: '#e08a96', belly: '#4a3a44', mouth: '#4d2733',
  tooth: '#f4f1e8', foot: '#120e18',
};
function batColorsFor(theme) {
  return theme === 'dark'
    ? { ...BAT_COLORS_SHARED, 'fur-body': '#2f2637', wing: '#241d2b', 'wing-dark': '#1a1420', marca: '#ff3b21' }
    : { ...BAT_COLORS_SHARED, 'fur-body': '#241d2b', wing: '#1b1622', 'wing-dark': '#120e18', marca: '#c86b7a' };
}

function rectsFrom(cells, px, colorOf) {
  return cells.map(([area, key]) => {
    const [r1, c1, r2, c2] = area.split('/').map(Number);
    const x = (c1 - 1) * px, y = (r1 - 1) * px, w = (c2 - c1) * px, h = (r2 - r1) * px;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colorOf(key)}"/>`;
  }).join('');
}

function buildSvg(theme) {
  const px = 4;
  const W = 20 * px, H = 15 * px;
  const c = batColorsFor(theme);

  const base = rectsFrom(BAT_BASE, px, (k) => c[k]);
  const wu = rectsFrom(BAT_WING_UP, px, (k) => c[k]);
  const wd = rectsFrom(BAT_WING_DOWN, px, (k) => c[k]);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-label="Tina, morceguinha pixelada, batendo asa">
<style>
  #tina{ animation: flutua .34s steps(1) infinite; }
  @keyframes flutua{ 0%,49.9%{ transform:translateY(1.5px); } 50%,100%{ transform:translateY(-1.5px); } }
  .wing-up{ animation: asas .34s steps(1) infinite; }
  .wing-down{ animation: asas .34s steps(1) infinite; }
  @keyframes asas{ 0%,49.9%{ opacity:1; } 50%,100%{ opacity:0; } }
  .wing-down{ animation-delay: .17s; }
</style>
<g id="tina">
  <g class="wing-up">${wu}</g>
  <g class="wing-down" style="opacity:0">${wd}</g>
  ${base}
</g>
</svg>`;
}

async function main() {
  const light = buildSvg('light');
  const dark = buildSvg('dark');
  await writeFile(new URL('../assets/tina-voando.svg', import.meta.url), light);
  await writeFile(new URL('../assets/tina-voando-dark.svg', import.meta.url), dark);
  console.log('Gerado assets/tina-voando.svg e -dark.svg');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
