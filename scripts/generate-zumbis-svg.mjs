#!/usr/bin/env node
// Desenha a Agatha caçando zumbis: ela atira teia, enche a barra de furia e
// entra em modo furioso; a Tina sobrevoa soltando tokens que sangram e
// atrasam os zumbis. Cena decorativa (nao depende de dados reais do
// GitHub) — reaproveita o pixel art dos personagens do board de design
// (Pixel Spider / Pixel Zombie / Pixel Bat).

import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// ---- pixel art: [gridArea "row1/col1/row2/col2", classe] ----

const SPIDER_CELLS = [
  ['7/10/8/16', 'b'], ['8/9/9/17', 'b'], ['8/10/9/12', 'hi'], ['9/8/10/18', 'b'], ['10/8/11/18', 'b'],
  ['11/8/12/9', 'b'], ['11/9/12/11', 'eye'], ['11/11/12/15', 'b'], ['11/15/12/17', 'eye'], ['11/17/12/18', 'b'],
  ['12/8/13/9', 'b'], ['12/9/13/11', 'eye'], ['12/11/13/12', 'pupil'], ['12/12/13/14', 'b'], ['12/14/13/15', 'pupil'],
  ['12/15/13/17', 'eye'], ['12/17/13/18', 'b'], ['13/8/14/18', 'b'], ['14/9/15/17', 'b'], ['15/10/16/16', 'b'],
  ['16/11/17/15', 'b'],
  ['17/11/18/12', 'fang'], ['17/14/18/15', 'fang'],
  ['9/7/10/8', 'la'], ['8/6/9/7', 'la'], ['7/4/8/6', 'la'], ['6/3/7/4', 'la'],
  ['11/7/12/8', 'la'], ['10/5/11/7', 'la'], ['9/3/10/5', 'la'],
  ['12/7/13/8', 'la'], ['13/5/14/7', 'la'], ['14/3/15/5', 'la'],
  ['14/8/15/9', 'la'], ['15/7/16/8', 'la'], ['16/5/17/7', 'la'], ['17/4/18/5', 'la'],
  ['9/18/10/19', 'la'], ['8/19/9/20', 'la'], ['7/20/8/22', 'la'], ['6/22/7/23', 'la'],
  ['11/18/12/19', 'la'], ['10/19/11/21', 'la'], ['9/21/10/23', 'la'],
  ['12/18/13/19', 'la'], ['13/19/14/21', 'la'], ['14/21/15/23', 'la'],
  ['14/17/15/18', 'la'], ['15/18/16/19', 'la'], ['16/19/17/21', 'la'], ['17/21/18/22', 'la'],
  ['9/7/10/8', 'lb'], ['8/6/9/7', 'lb'], ['7/5/8/6', 'lb'], ['6/3/7/5', 'lb'], ['7/2/10/3', 'lb'],
  ['11/7/12/8', 'lb'], ['10/6/11/7', 'lb'], ['9/5/10/6', 'lb'], ['9/4/12/5', 'lb'],
  ['13/7/14/8', 'lb'], ['14/6/15/7', 'lb'], ['15/5/16/6', 'lb'], ['16/4/19/5', 'lb'],
  ['14/8/15/9', 'lb'], ['15/7/18/8', 'lb'],
  ['9/18/10/19', 'lb'], ['8/19/9/20', 'lb'], ['7/20/8/21', 'lb'], ['6/21/7/23', 'lb'], ['7/23/10/24', 'lb'],
  ['11/18/12/19', 'lb'], ['10/19/11/20', 'lb'], ['9/20/10/21', 'lb'], ['9/21/12/22', 'lb'],
  ['13/18/14/19', 'lb'], ['14/19/15/20', 'lb'], ['15/20/16/21', 'lb'], ['16/21/19/22', 'lb'],
  ['14/17/15/18', 'lb'], ['15/18/18/19', 'lb'],
];

const ZOMBIE_BASE = [
  ['3/5/4/13', 'hair'], ['4/5/9/13', 'skin'], ['4/11/5/13', 'skin-dark'], ['6/5/7/6', 'skin-dark'],
  ['4/6/5/8', 'hair'], ['4/10/5/12', 'hair'], ['5/6/6/8', 'zeye'], ['5/10/6/12', 'zeye'],
  ['7/7/8/11', 'dark'], ['8/8/9/10', 'dark'], ['7/8/8/9', 'tooth'], ['7/10/8/11', 'tooth'],
  ['9/8/10/11', 'skin-dark'], ['10/5/16/13', 'shirt'], ['12/6/13/7', 'skin'], ['13/11/14/12', 'skin-dark'],
  ['15/7/16/8', 'shirt-dark'], ['11/9/12/10', 'shirt-dark'],
];
const ZOMBIE_POSE_A = [
  ['10/2/12/5', 'shirt'], ['10/1/12/2', 'skin'], ['12/3/14/5', 'shirt-dark'], ['12/2/14/3', 'skin-dark'],
  ['16/6/19/9', 'pants'], ['16/10/19/13', 'pants'], ['19/5/20/9', 'dark'], ['19/10/20/14', 'dark'],
];
const ZOMBIE_POSE_B = [
  ['9/2/11/5', 'shirt'], ['9/1/11/2', 'skin'], ['11/3/13/5', 'shirt-dark'], ['11/2/13/3', 'skin-dark'],
  ['16/7/18/10', 'pants'], ['18/5/20/8', 'pants'], ['19/4/20/8', 'dark'],
  ['16/9/18/12', 'pants'], ['18/11/20/14', 'pants'], ['19/11/20/15', 'dark'],
];

const BAT_BASE = [
  ['2/7/3/8', 'fur-body'], ['3/7/4/9', 'fur-body'], ['3/8/4/9', 'ear-inner'],
  ['2/14/3/15', 'fur-body'], ['3/13/4/15', 'fur-body'], ['3/13/4/14', 'ear-inner'],
  ['4/7/10/15', 'fur-body'], ['4/8/5/11', 'fur-hi'],
  ['6/8/8/10', 'bat-eye'], ['6/12/8/14', 'bat-eye'], ['7/9/8/10', 'pupil'], ['7/12/8/13', 'pupil'],
  ['8/10/9/12', 'nose'], ['10/9/14/13', 'fur-body'], ['11/10/14/12', 'belly'], ['12/10/13/11', 'marca'],
  ['9/9/10/13', 'mouth'], ['9/9/10/10', 'tooth'], ['9/12/10/13', 'tooth'],
  ['14/9/15/11', 'foot'], ['14/11/15/13', 'foot'],
];
const BAT_WING_REST = [
  ['7/7/13/9', 'wing'], ['8/6/13/7', 'wing-dark'], ['7/13/13/15', 'wing'], ['8/15/13/16', 'wing-dark'],
];
const BAT_WING_UP = [
  ['6/7/10/9', 'wing'], ['4/5/10/7', 'wing'], ['3/3/9/5', 'wing'], ['3/2/7/3', 'wing-dark'],
  ['6/13/10/15', 'wing'], ['4/15/10/17', 'wing'], ['3/17/9/19', 'wing'], ['3/19/7/20', 'wing-dark'],
];
const BAT_WING_DOWN = [
  ['9/7/13/9', 'wing'], ['9/5/14/7', 'wing'], ['10/3/15/5', 'wing'], ['11/2/15/3', 'wing-dark'],
  ['9/13/13/15', 'wing'], ['9/15/14/17', 'wing'], ['10/17/15/19', 'wing'], ['11/19/15/20', 'wing-dark'],
];

function rectsFrom(cells, px, colorOf, classOf) {
  return cells.map(([area, key]) => {
    const [r1, c1, r2, c2] = area.split('/').map(Number);
    const x = (c1 - 1) * px, y = (r1 - 1) * px, w = (c2 - c1) * px, h = (r2 - r1) * px;
    const cls = classOf ? classOf(key) : '';
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${cls ? `class="${cls}"` : ''} fill="${colorOf(key)}"/>`;
  }).join('');
}

function spiderGroup(px, c) {
  const normal = rectsFrom(
    SPIDER_CELLS.filter(([, k]) => k === 'eye' || k === 'pupil'),
    px, (k) => (k === 'eye' ? c.eye : c.pupil),
  );
  const fury = rectsFrom(
    SPIDER_CELLS.filter(([, k]) => k === 'eye' || k === 'pupil' || k === 'fang'),
    px, (k) => (k === 'eye' ? c.furyEye : k === 'pupil' ? c.furyPupil : c.furyFang),
  );
  const body = rectsFrom(
    SPIDER_CELLS.filter(([, k]) => k === 'b' || k === 'hi'),
    px, (k) => (k === 'hi' ? c.hi : c.body),
  );
  const legA = rectsFrom(SPIDER_CELLS.filter(([, k]) => k === 'la'), px, () => `var(--leg-a-sp, ${c.body})`);
  const legB = rectsFrom(SPIDER_CELLS.filter(([, k]) => k === 'lb'), px, () => `var(--leg-b-sp, transparent)`);
  return `<g id="sp">${body}${legA}${legB}<g class="eye-normal">${normal}</g><g class="eye-fury" filter="url(#furyGlow)">${fury}</g></g>`;
}

function zombieGroup(px, c) {
  const base = rectsFrom(ZOMBIE_BASE, px, (k) => c[k]);
  const poseA = rectsFrom(ZOMBIE_POSE_A, px, (k) => c[k]);
  const poseB = rectsFrom(ZOMBIE_POSE_B, px, (k) => c[k]);
  return `${base}<g class="zpose-a">${poseA}</g><g class="zpose-b">${poseB}</g>`;
}

function batGroup(px, c) {
  const base = rectsFrom(BAT_BASE, px, (k) => c[k], (k) => (k === 'pupil' ? 'tina-pupil' : ''));
  const wr = rectsFrom(BAT_WING_REST, px, (k) => c[k]);
  const wu = rectsFrom(BAT_WING_UP, px, (k) => c[k]);
  const wd = rectsFrom(BAT_WING_DOWN, px, (k) => c[k]);
  return `<g class="wing-rest">${wr}</g><g class="wing-up">${wu}</g><g class="wing-down">${wd}</g>${base}`;
}

// pontinhos de teia — mesmo padrao usado na versao "teia nos commits"
function webBurst(color) {
  return ['1/1/2/2', '1/3/2/4', '1/5/2/6', '2/2/3/5', '3/1/4/3', '3/4/4/6', '4/2/5/5', '5/1/6/2', '5/3/6/4', '5/5/6/6']
    .map((area) => {
      const [r1, c1, r2, c2] = area.split('/').map(Number);
      const s = 3.4;
      return `<rect x="${(c1 - 1) * s}" y="${(r1 - 1) * s}" width="${(c2 - c1) * s}" height="${(r2 - r1) * s}" fill="${color}"/>`;
    }).join('');
}

const ZOMBIE_PALETTES = [
  { hair: '#2f3a2a', skin: '#7aa35f', 'skin-dark': '#557a45', zeye: '#ff3b21', dark: '#14171e', tooth: '#f4f1e8', shirt: '#46536a', 'shirt-dark': '#333d4f', pants: '#2b3140' },
  { hair: '#2f3a2a', skin: '#6d9455', 'skin-dark': '#4a6b3d', zeye: '#ff3b21', dark: '#14171e', tooth: '#f4f1e8', shirt: '#5a4a4a', 'shirt-dark': '#3f3434', pants: '#2b3140' },
  { hair: '#2f3a2a', skin: '#84a86a', 'skin-dark': '#557a45', zeye: '#ff3b21', dark: '#14171e', tooth: '#f4f1e8', shirt: '#3b4f5c', 'shirt-dark': '#2b3b45', pants: '#2b3140' },
  { hair: '#2f3a2a', skin: '#5f8a4c', 'skin-dark': '#557a45', zeye: '#ff3b21', dark: '#14171e', tooth: '#f4f1e8', shirt: '#4a3628', 'shirt-dark': '#33251b', pants: '#2b3140' },
];

const BAT_COLORS = {
  'fur-body': '#241d2b', 'fur-hi': '#362c40', 'ear-inner': '#c86b7a', 'bat-eye': '#f4f1e8',
  pupil: '#ff3b21', nose: '#e08a96', belly: '#4a3a44', marca: '#c86b7a', mouth: '#4d2733',
  tooth: '#f4f1e8', foot: '#120e18', wing: '#1b1622', 'wing-dark': '#120e18',
};

// zumbi N: entra em cena em vivoStart, leva o tiro em hitAt, some em vivoEnd
const ZOMBIES = [
  { x: 580, vivoStart: 0, hitAt: 24, vivoEnd: 40, lento: true },
  { x: 540, vivoStart: 30, hitAt: 54, vivoEnd: 70, lento: true },
  { x: 500, vivoStart: 62, hitAt: 76, vivoEnd: 87, lento: true },
  { x: 460, vivoStart: 76, hitAt: 90, vivoEnd: 100, lento: false },
];
const FURIA_EM = 56; // % em que a barra de furia enche e a Agatha entra em modo furioso

function buildSvg(theme) {
  const W = 760, H = 300;
  const dark = theme === 'dark';
  const bg = dark ? '#0d1117' : '#ffffff';
  const groundColor = dark ? '#2a3340' : '#d3d9df';
  const labelColor = dark ? '#7d8590' : '#57606a';
  const threadColor = dark ? '#4d5561' : '#b9c1c9';
  const fontFamily = '-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif';
  const NEON = '#ff1e3c';
  const TOKEN_PINK = '#ff2d95';

  const spiderColors = dark
    ? { body: '#1c2128', hi: '#2f3641', eye: '#f4f1e8', pupil: '#ff3b21', furyEye: '#ff3b21', furyPupil: '#5a0d03', furyFang: '#f4f1e8' }
    : { body: '#0c0c0f', hi: '#26262e', eye: '#f4f1e8', pupil: '#ff3b21', furyEye: '#ff3b21', furyPupil: '#5a0d03', furyFang: '#f4f1e8' };

  const groundY = 230;
  const spPx = 6, spW = 24 * spPx, spH = 20 * spPx;
  const zPx = 6, zW = 16 * zPx, zH = 20 * zPx;
  const bPx = 4, bW = 20 * bPx, bH = 15 * bPx;

  const agathaX = 18, agathaY = groundY - spH;
  const muzzleX = agathaX + spW - 16, muzzleY = agathaY + 44;

  const style = [];
  const defs = [];
  const scene = [];

  scene.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="${bg}"/>`);
  scene.push(`<rect x="0" y="${groundY}" width="${W}" height="2" fill="${groundColor}"/>`);

  // --- Agatha ---
  // Nota de implementacao: um elemento SVG nao pode ter ao mesmo tempo um
  // atributo `transform="translate(...)"` estatico E uma animacao CSS de
  // `transform` — a propriedade CSS substitui o atributo por completo (nao
  // soma). Por isso todo posicionamento fixo fica num <g> "de fora" sem CSS,
  // e a animacao de transform sempre vai num <g> "de dentro" sem atributo.
  const BAR_W = 90;
  style.push(`
    @keyframes pernas{ 0%,49.9%{ --leg-a-sp:${spiderColors.body}; --leg-b-sp:transparent; } 50%,100%{ --leg-a-sp:transparent; --leg-b-sp:${spiderColors.body}; } }
    #sp{ animation: pernas .5s steps(1) infinite; }
    .eye-normal{ animation: eyeNormal 11s linear infinite; }
    .eye-fury{ animation: eyeFury 11s linear infinite; }
    @keyframes eyeNormal{ 0%,${FURIA_EM - 0.1}%{opacity:1} ${FURIA_EM}%,100%{opacity:0} }
    @keyframes eyeFury{ 0%,${FURIA_EM - 0.1}%{opacity:0} ${FURIA_EM}%,100%{opacity:1} }
    #agatha{ animation: recuo 11s linear infinite; }
    @keyframes recuo{
      0%,21%{transform:translateX(0)} 23%{transform:translateX(-8px)} 27%,51%{transform:translateX(0)}
      53%{transform:translateX(-8px)} 57%,73%{transform:translateX(0)} 75%{transform:translateX(-8px)}
      78%,87%{transform:translateX(0)} 89%{transform:translateX(-8px)} 92%,100%{transform:translateX(0)}
    }
    .furia-barra{ animation: cargaBarra 11s linear infinite; }
    @keyframes cargaBarra{ 0%,23.9%{width:0px} 24%,53.9%{width:${BAR_W * 0.34}px} 54%,${FURIA_EM - 0.1}%{width:${BAR_W * 0.68}px} ${FURIA_EM}%,100%{width:${BAR_W}px} }
    .furia-label{ animation: furiaLabel 11s linear infinite; }
    @keyframes furiaLabel{ 0%,${FURIA_EM - 0.1}%{opacity:0} ${FURIA_EM}%{opacity:1} ${FURIA_EM + 4}%{opacity:.35} ${FURIA_EM + 8}%{opacity:1} 100%{opacity:1} }
  `);
  defs.push(`<filter id="furyGlow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="1.6" flood-color="${spiderColors.furyPupil}"/></filter>`);

  scene.push(`<g transform="translate(${agathaX},${agathaY})"><g id="agatha">${spiderGroup(spPx, spiderColors)}</g></g>`);
  scene.push(`<rect x="${agathaX + 10}" y="${agathaY + spH + 12}" width="${BAR_W}" height="6" fill="${groundColor}"/>`);
  scene.push(`<rect class="furia-barra" x="${agathaX + 10}" y="${agathaY + spH + 12}" width="0" height="6" fill="#ff3b21"/>`);
  scene.push(`<text class="furia-label" x="${agathaX + 10}" y="${agathaY + spH + 30}" font-family="${fontFamily}" font-size="11" letter-spacing="1.5" fill="#ff3b21">FÚRIA</text>`);

  // --- zumbis ---
  style.push(`
    @keyframes zpose{ 0%,49.9%{--pa:1;--pb:0} 50%,100%{--pa:0;--pb:1} }
    @keyframes zbob{ 0%,49.9%{transform:translateY(0)} 50%,100%{transform:translateY(-3px)} }
    .zpose-a{ opacity: var(--pa, 1); }
    .zpose-b{ opacity: var(--pb, 0); }
  `);

  const ZBAR_W = zW - 28;
  ZOMBIES.forEach((z, i) => {
    const idx = i + 1;
    const c = ZOMBIE_PALETTES[i];
    const targetCx = z.x + zW / 2;
    const zombieY = groundY - zH;
    style.push(`
      @keyframes zEntra${idx}{ 0%{transform:translateX(${W - z.x + 40}px)} ${z.hitAt - 4}%{transform:translateX(6px)} ${z.hitAt}%,100%{transform:translateX(0)} }
      @keyframes zVivo${idx}{ 0%,${z.vivoStart - 0.1}%{opacity:${i === 0 ? 1 : 0}} ${z.vivoStart}%,${z.vivoEnd - 4}%{opacity:1} ${z.vivoEnd}%,100%{opacity:0} }
      @keyframes zGray${idx}{ 0%,${z.hitAt - 0.1}%{filter:none} ${z.hitAt}%,100%{filter:grayscale(.7) brightness(.8)} }
      #z${idx}{ animation: zEntra${idx} 11s linear infinite, zVivo${idx} 11s linear infinite; }
      #z${idx} .zbody{ animation: zbob ${0.4 + i * 0.06}s steps(1) infinite, zGray${idx} 11s linear infinite; }
      #z${idx} .zpx{ animation: zpose .46s steps(1) infinite; }
      @keyframes zBar${idx}{ 0%,${z.hitAt - 0.1}%{width:0px} ${z.hitAt}%,${z.hitAt + 10}%{width:${ZBAR_W}px} ${z.vivoEnd}%,100%{width:${ZBAR_W}px} }
      .zbar${idx}{ animation: zBar${idx} 11s linear infinite; }
    `);
    scene.push(`<g transform="translate(${z.x},0)"><g id="z${idx}">
      <g transform="translate(0,${zombieY})"><g class="zbody">
        <g class="zpx">${zombieGroup(zPx, c)}</g>
      </g></g>
      <rect x="14" y="${zombieY - 14}" width="${ZBAR_W}" height="5" fill="${groundColor}"/>
      <rect class="zbar${idx}" x="14" y="${zombieY - 14}" width="0" height="5" fill="#ff3b21"/>
    </g></g>`);

    if (z.lento) {
      style.push(`
        @keyframes zLento${idx}{ 0%,${z.hitAt + 3}%{opacity:0} ${z.hitAt + 4}%,${z.vivoEnd - 6}%{opacity:1} ${z.vivoEnd - 2}%,100%{opacity:0} }
        .lento${idx}{ animation: zLento${idx} 11s linear infinite; }
      `);
      scene.push(`<g class="lento${idx}" transform="translate(${z.x + 8},${zombieY + 30})">
        <rect x="0" y="0" width="4" height="3" fill="${TOKEN_PINK}"/>
        <rect x="6" y="4" width="4" height="3" fill="${TOKEN_PINK}"/>
        <rect x="2" y="9" width="4" height="3" fill="${TOKEN_PINK}"/>
        <text x="-2" y="26" font-family="${fontFamily}" font-size="8" letter-spacing="1" fill="${TOKEN_PINK}">LENTO</text>
      </g>`);
    }

    // rajada de teia no zumbi
    const burstColor = z.hitAt >= FURIA_EM ? NEON : (dark ? '#e8e5dd' : '#f6f8fa');
    const burstFilter = z.hitAt >= FURIA_EM ? ' filter="url(#neonGlow)"' : '';
    style.push(`
      @keyframes teia${idx}{ 0%,${z.hitAt - 0.1}%{transform:scale(.2);opacity:0} ${z.hitAt}%{transform:scale(1);opacity:1} ${z.hitAt + 8}%{transform:scale(1);opacity:1} ${z.hitAt + 12}%,100%{transform:scale(1);opacity:0} }
      .teia${idx}{ animation: teia${idx} 11s linear infinite; transform-box: fill-box; transform-origin: center; }
      @keyframes tiro${idx}{
        0%,${z.hitAt - 3}%{ transform:translate(${muzzleX}px,${muzzleY}px); opacity:0; }
        ${z.hitAt - 1.6}%{ opacity:1; }
        ${z.hitAt}%{ transform:translate(${targetCx - 2.5}px,150px); opacity:1; }
        ${z.hitAt + 0.5}%,100%{ transform:translate(${targetCx - 2.5}px,150px); opacity:0; }
      }
      .tiro${idx}{ animation: tiro${idx} 11s linear infinite; }
    `);
    scene.push(`<rect class="tiro${idx}" x="0" y="0" width="5" height="5" rx="1" fill="${z.hitAt >= FURIA_EM ? NEON : threadColor}"/>`);
    scene.push(`<g transform="translate(${targetCx - 17},120)"${burstFilter}><g class="teia${idx}">${webBurst(burstColor)}</g></g>`);
  });

  defs.push(`<filter id="neonGlow" x="-80%" y="-80%" width="260%" height="260%"><feDropShadow dx="0" dy="0" stdDeviation="2.2" flood-color="${NEON}"/></filter>`);

  // --- Tina ---
  style.push(`
    @keyframes asas{ 0%,49.9%{--wu:1;--wd:0} 50%,100%{--wu:0;--wd:1} }
    .wing-rest{ opacity: 0; }
    .wing-up{ opacity: var(--wu, 0); animation: asas .34s steps(1) infinite; }
    .wing-down{ opacity: var(--wd, 1); animation: asas .34s steps(1) infinite; }
    @keyframes tinaVoa{
      0%{transform:translate(-140px,26px)} 26%{transform:translate(600px,26px)} 40%{transform:translate(660px,26px)}
      58%{transform:translate(680px,26px)} 72%{transform:translate(600px,26px)} 80%{transform:translate(700px,26px)}
      87%{transform:translate(820px,26px)} 94%{transform:translate(1050px,26px)} 100%{transform:translate(1300px,26px)}
    }
    #tina{ animation: tinaVoa 11s linear infinite; }
    @keyframes tflutua{ 0%,49.9%{transform:translateY(0)} 50%,100%{transform:translateY(-4px)} }
    #tinaBody{ animation: tflutua .34s steps(1) infinite; }
    @keyframes olhoTina{ 0%,${73.9}%{fill:#ff3b21} 74%{fill:${TOKEN_PINK}} 76%{fill:#f4f1e8} 78%,100%{fill:${TOKEN_PINK}} }
    .tina-pupil{ animation: olhoTina 11s linear infinite; }
  `);
  const batBody = batGroup(bPx, BAT_COLORS);
  scene.push(`<g id="tina"><g id="tinaBody">${batBody}</g></g>`);

  // 3 tokens caindo da Tina sobre os 3 primeiros zumbis
  const dropTimes = [26, 42, 74];
  ZOMBIES.slice(0, 3).forEach((z, i) => {
    const t = dropTimes[i];
    const cx = z.x + zW / 2;
    style.push(`
      @keyframes gota${i + 1}{
        0%,${t - 0.1}%{ transform:translate(${cx}px,40px); opacity:0; }
        ${t}%{ transform:translate(${cx}px,40px); opacity:1; }
        ${t + 2}%{ transform:translate(${cx}px,${groundY - zH + 40}px); opacity:1; }
        ${t + 2.1}%,100%{ transform:translate(${cx}px,${groundY - zH + 40}px); opacity:0; }
      }
      .gota${i + 1}{ animation: gota${i + 1} 11s linear infinite; }
    `);
    scene.push(`<rect class="gota${i + 1}" x="0" y="0" width="5" height="5" rx="1" fill="${TOKEN_PINK}" filter="url(#tokenGlow)"/>`);
  });
  defs.push(`<filter id="tokenGlow" x="-80%" y="-80%" width="260%" height="260%"><feDropShadow dx="0" dy="0" stdDeviation="1.6" flood-color="${TOKEN_PINK}"/></filter>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" shape-rendering="crispEdges" role="img" aria-label="Agatha e Tina cacando zumbis, com barra de furia">
<defs>${defs.join('')}</defs>
<style>${style.join('\n')}</style>
${scene.join('\n')}
</svg>`;
}

async function main() {
  const light = buildSvg('light');
  const dark = buildSvg('dark');
  await writeFile(new URL('../assets/agatha-cacando-zumbis.svg', import.meta.url), light);
  await writeFile(new URL('../assets/agatha-cacando-zumbis-dark.svg', import.meta.url), dark);
  console.log('Gerado assets/agatha-cacando-zumbis.svg e -dark.svg');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
