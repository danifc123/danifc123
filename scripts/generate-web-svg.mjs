#!/usr/bin/env node
// Le o calendario real de contribuicoes do GitHub e desenha a Agatha
// atirando teia em cima dos dois dias com mais commits.
// Reaproveita o pixel art do mascote (mesmas celulas do componente "Pixel Spider").

import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const LOGIN = process.env.GH_LOGIN || 'danifc123';

// Mesmo endpoint publico (sem autenticacao) que o proprio GitHub usa pra
// desenhar o gráfico de contribuições no perfil. Cada <td> já vem com
// data-date e data-level (0-4), então nem precisamos de token.
async function fetchCalendar() {
  const res = await fetch(`https://github.com/users/${LOGIN}/contributions`, {
    headers: { 'User-Agent': 'agatha-teia-commits' },
  });
  if (!res.ok) {
    throw new Error(`GitHub respondeu ${res.status} ao buscar o grafico de contribuicoes.`);
  }
  const html = await res.text();
  const re = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
  const raw = [];
  let m;
  while ((m = re.exec(html))) {
    raw.push({ date: m[1], level: Number(m[2]) });
  }
  if (raw.length === 0) {
    throw new Error('Nao encontrei nenhum dia no grafico de contribuicoes — o GitHub deve ter mudado o formato da pagina.');
  }
  return toWeeks(raw);
}

function toWeeks(raw) {
  const withTime = raw.map((d) => ({ ...d, t: Date.parse(`${d.date}T00:00:00Z`) }));
  const minSunday = Math.min(...withTime.map((d) => d.t - new Date(d.t).getUTCDay() * 86400000));
  const weeksMap = new Map();
  withTime.forEach((d) => {
    const dt = new Date(d.t);
    const weekday = dt.getUTCDay();
    const weekIndex = Math.round((d.t - weekday * 86400000 - minSunday) / (7 * 86400000));
    if (!weeksMap.has(weekIndex)) weeksMap.set(weekIndex, []);
    weeksMap.get(weekIndex).push({ date: d.date, weekday, level: d.level });
  });
  return [...weeksMap.keys()].sort((a, b) => a - b).map((wi) => ({
    contributionDays: weeksMap.get(wi).sort((a, b) => a.weekday - b.weekday),
  }));
}

export function pickTargets(weeks) {
  const days = [];
  weeks.forEach((w, weekIndex) => {
    w.contributionDays.forEach((d) => {
      days.push({ weekIndex, weekday: d.weekday, level: d.level, date: d.date });
    });
  });
  let top = days.filter((d) => d.level > 0).sort((a, b) => (b.level - a.level) || (b.date < a.date ? -1 : 1)).slice(0, 2);
  if (top.length === 0) top = [days.at(-1), days.at(-1)];
  if (top.length === 1) top = [top[0], top[0]];
  top.sort((a, b) => a.weekIndex - b.weekIndex);
  return top;
}

// [gridArea "row1/col1/row2/col2", classe] — extraido do componente Pixel Spider
const SPIDER_CELLS = [
  ['7/10/8/16', 'b'], ['8/9/9/17', 'b'], ['8/10/9/12', 'hi'], ['9/8/10/18', 'b'], ['10/8/11/18', 'b'],
  ['11/8/12/9', 'b'], ['11/9/12/11', 'eye'], ['11/11/12/15', 'b'], ['11/15/12/17', 'eye'], ['11/17/12/18', 'b'],
  ['12/8/13/9', 'b'], ['12/9/13/11', 'eye'], ['12/11/13/12', 'pupil'], ['12/12/13/14', 'b'], ['12/14/13/15', 'pupil'],
  ['12/15/13/17', 'eye'], ['12/17/13/18', 'b'], ['13/8/14/18', 'b'], ['14/9/15/17', 'b'], ['15/10/16/16', 'b'],
  ['16/11/17/15', 'b'],
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

export function buildSvg(weeks, targets, theme) {
  const CELL = 11, GAP = 3, PITCH = CELL + GAP;
  const cols = weeks.length;
  const rows = 7;
  const gridW = cols * PITCH - GAP;
  const gridH = rows * PITCH - GAP;
  const marginLeft = 150, marginTop = 30, marginRight = 16, marginBottom = 34;
  const width = marginLeft + gridW + marginRight;
  const height = marginTop + gridH + marginBottom;

  const palette = theme === 'dark'
    ? ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']
    : ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
  const bg = theme === 'dark' ? '#0d1117' : '#ffffff';
  const bodyColors = theme === 'dark'
    ? { body: '#1c2128', hi: '#2f3641', eye: '#f4f1e8', pupil: '#ff3b21' }
    : { body: '#0c0c0f', hi: '#26262e', eye: '#f4f1e8', pupil: '#ff3b21' };
  const threadColor = theme === 'dark' ? '#4d5561' : '#b9c1c9';
  const webColor = bg;
  const labelColor = theme === 'dark' ? '#7d8590' : '#57606a';
  const fontFamily = '-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif';

  const cells = [];
  weeks.forEach((w, wi) => {
    w.contributionDays.forEach((d) => {
      const x = marginLeft + wi * PITCH;
      const y = marginTop + d.weekday * PITCH;
      cells.push(`<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${palette[d.level]}"/>`);
    });
  });

  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((w, wi) => {
    const first = w.contributionDays[0];
    if (!first) return;
    const m = new Date(`${first.date}T00:00:00Z`).getUTCMonth();
    if (m !== lastMonth && wi > 0) {
      monthLabels.push(`<text x="${marginLeft + wi * PITCH}" y="${marginTop - 10}" font-family="${fontFamily}" font-size="10" fill="${labelColor}">${MESES[m]}</text>`);
    }
    lastMonth = m;
  });

  const weekdayLabels = [1, 3, 5].map((wd) => {
    const label = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'][wd];
    const y = marginTop + wd * PITCH + CELL - 1;
    return `<text x="${marginLeft - 8}" y="${y}" text-anchor="end" font-family="${fontFamily}" font-size="9" fill="${labelColor}">${label}</text>`;
  });

  const legendY = marginTop + gridH + 20;
  const legendSwatches = palette.map((c, i) => `<rect x="${width - marginRight - (5 - i) * (CELL - 1)}" y="${legendY - CELL + 1}" width="${CELL - 3}" height="${CELL - 3}" rx="2" fill="${c}"/>`).join('');
  const legend = `
    <text x="${width - marginRight - 5 * (CELL - 1) - 30}" y="${legendY}" text-anchor="end" font-family="${fontFamily}" font-size="9" fill="${labelColor}">menos</text>
    ${legendSwatches}
    <text x="${width - marginRight + 2}" y="${legendY}" font-family="${fontFamily}" font-size="9" fill="${labelColor}">mais</text>
  `;

  const toXY = (t) => ({
    x: marginLeft + t.weekIndex * PITCH + CELL / 2,
    y: marginTop + t.weekday * PITCH + CELL / 2,
  });
  const t1 = toXY(targets[0]);
  const t2 = toXY(targets[1]);

  const spiderPx = 3;
  const spiderX = 8;
  const spiderY = marginTop + gridH / 2 - (20 * spiderPx) / 2;
  const muzzleX = spiderX + 24 * spiderPx - 6;
  const muzzleY = spiderY + 34;

  const teiaDots = [
    '1/1/2/2', '1/3/2/4', '1/5/2/6', '2/2/3/5', '3/1/4/3',
    '3/4/4/6', '4/2/5/5', '5/1/6/2', '5/3/6/4', '5/5/6/6',
  ].map((area) => {
    const [r1, c1, r2, c2] = area.split('/').map(Number);
    const s = 3;
    return `<rect x="${(c1 - 1) * s}" y="${(r1 - 1) * s}" width="${(c2 - c1) * s}" height="${(r2 - r1) * s}" fill="${webColor}"/>`;
  }).join('');

  const style = `
    .thread{ animation: fio-bob 6s ease-in-out infinite; }
    @keyframes fio-bob{ 0%,100%{ transform:translateY(0);} 50%{ transform:translateY(-4px);} }
    @keyframes pernas{ 0%,49.9%{ --leg-a-sp: ${bodyColors.body}; --leg-b-sp: transparent; } 50%,100%{ --leg-a-sp: transparent; --leg-b-sp: ${bodyColors.body}; } }
    #sp{ animation: pernas .5s steps(1) infinite; }
    #sp .la{ fill: var(--leg-a-sp, ${bodyColors.body}); }
    #sp .lb{ fill: var(--leg-b-sp, transparent); }
    .lanca{ transform-box: fill-box; transform-origin: center; animation: lanca 9s linear infinite; }
    @keyframes lanca{
      0%,17%{ transform:translateY(0); } 19%{ transform:translateY(-4px); }
      23%,67%{ transform:translateY(0); } 69%{ transform:translateY(-4px); }
      73%,100%{ transform:translateY(0); }
    }
    .tiro{ transform-box: fill-box; }
    .tiroA{ animation: tiroA 9s linear infinite; }
    .tiroB{ animation: tiroB 9s linear infinite; }
    @keyframes tiroA{
      0%,3%{ transform:translate(${muzzleX}px,${muzzleY}px); opacity:0; }
      5%{ opacity:1; }
      22%{ transform:translate(${t1.x - 2.5}px,${t1.y - 2.5}px); opacity:1; }
      24%,100%{ transform:translate(${t1.x - 2.5}px,${t1.y - 2.5}px); opacity:0; }
    }
    @keyframes tiroB{
      0%,53%{ transform:translate(${muzzleX}px,${muzzleY}px); opacity:0; }
      55%{ opacity:1; }
      72%{ transform:translate(${t2.x - 2.5}px,${t2.y - 2.5}px); opacity:1; }
      74%,100%{ transform:translate(${t2.x - 2.5}px,${t2.y - 2.5}px); opacity:0; }
    }
    .teia{ transform-box: fill-box; transform-origin: center; }
    .teiaA{ animation: teiaA 9s linear infinite; }
    .teiaB{ animation: teiaB 9s linear infinite; }
    @keyframes teiaA{
      0%,22%{ transform:translate(${t1.x - 10}px,${t1.y - 10}px) scale(0); opacity:0; }
      24%{ transform:translate(${t1.x - 10}px,${t1.y - 10}px) scale(1); opacity:1; }
      46%{ transform:translate(${t1.x - 10}px,${t1.y - 10}px) scale(1); opacity:1; }
      50%,100%{ transform:translate(${t1.x - 10}px,${t1.y - 10}px) scale(1); opacity:0; }
    }
    @keyframes teiaB{
      0%,72%{ transform:translate(${t2.x - 10}px,${t2.y - 10}px) scale(0); opacity:0; }
      74%{ transform:translate(${t2.x - 10}px,${t2.y - 10}px) scale(1); opacity:1; }
      96%{ transform:translate(${t2.x - 10}px,${t2.y - 10}px) scale(1); opacity:1; }
      100%{ transform:translate(${t2.x - 10}px,${t2.y - 10}px) scale(1); opacity:0; }
    }
  `;

  const spider = spiderGroupInline(spiderPx, bodyColors);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges" role="img" aria-label="Agatha atirando teia sobre os commits reais de danifc123">
<rect x="0" y="0" width="${width}" height="${height}" fill="${bg}"/>
<style>${style}</style>
${monthLabels.join('')}
${weekdayLabels.join('')}
${cells.join('')}
${legend}
<g class="lanca" transform="translate(${spiderX},${spiderY})">${spider}</g>
<rect class="tiro tiroA" x="0" y="0" width="5" height="5" rx="1" fill="${threadColor}"/>
<rect class="tiro tiroB" x="0" y="0" width="5" height="5" rx="1" fill="${threadColor}"/>
<g class="teia teiaA">${teiaDots}</g>
<g class="teia teiaB">${teiaDots}</g>
</svg>`;
}

function spiderGroupInline(px, colors) {
  const rects = SPIDER_CELLS.map(([area, cls]) => {
    const [r1, c1, r2, c2] = area.split('/').map(Number);
    const x = (c1 - 1) * px;
    const y = (r1 - 1) * px;
    const w = (c2 - c1) * px;
    const h = (r2 - r1) * px;
    let fill;
    let cls2 = '';
    if (cls === 'b') fill = colors.body;
    else if (cls === 'hi') fill = colors.hi;
    else if (cls === 'eye') fill = colors.eye;
    else if (cls === 'pupil') fill = colors.pupil;
    else if (cls === 'la') { fill = colors.body; cls2 = 'la'; }
    else { fill = 'transparent'; cls2 = 'lb'; }
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${cls2 ? `class="${cls2}"` : ''} fill="${fill}"/>`;
  });
  return `<g id="sp">${rects.join('')}</g>`;
}

async function main() {
  const weeks = await fetchCalendar();
  const targets = pickTargets(weeks);
  const light = buildSvg(weeks, targets, 'light');
  const dark = buildSvg(weeks, targets, 'dark');
  await writeFile(new URL('../assets/agatha-teia-commits.svg', import.meta.url), light);
  await writeFile(new URL('../assets/agatha-teia-commits-dark.svg', import.meta.url), dark);
  console.log('Gerado assets/agatha-teia-commits.svg e -dark.svg');
  console.log('Alvos escolhidos:', targets);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
