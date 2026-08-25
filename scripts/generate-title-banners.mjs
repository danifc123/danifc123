#!/usr/bin/env node
// Gera os banners de titulo do README (label vermelho rastreado + titulo
// grande em blocao) na mesma linguagem visual dos arquivos do board de
// design — fonte Silkscreen (pixel font), label vermelho #ff3b21, regua
// fina embaixo. O GitHub sanitiza @font-face em Markdown puro, entao o
// jeito de usar a fonte de verdade e' embutir ela (base64) dentro do SVG.

import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

async function fontDataUri(path, mime) {
  const buf = await readFile(new URL(path, import.meta.url));
  return `data:${mime};base64,${buf.toString('base64')}`;
}

// larguras medidas de verdade num Chromium headless (getComputedTextLength)
// pro par fonte/tamanho/texto de cada banner — evita clipping ou sobra de
// espaco sem precisar rodar um browser toda vez que o script roda.
const BANNERS = [
  {
    id: 'titulo-nome', width: 680, height: 136,
    label: 'SOFTWARE ENGINEER / AI AGENT DEVELOPER', labelSize: 13, labelLs: 0.16, labelW: 411,
    title: 'DANIEL FARIA DO CARMO', titleSize: 34, titleLs: 0.02, titleW: 572,
  },
  {
    id: 'titulo-stack', width: 680, height: 104,
    label: 'TECNOLOGIA', labelSize: 13, labelLs: 0.18, labelW: 113,
    title: 'STACK', titleSize: 44, titleLs: 0.02, titleW: 192,
  },
  {
    id: 'titulo-status', width: 680, height: 104,
    label: 'MÉTRICAS', labelSize: 13, labelLs: 0.18, labelW: 91,
    title: 'STATUS DE DESENVOLVIMENTO', titleSize: 28, titleLs: 0.02, titleW: 585,
  },
  {
    id: 'titulo-zumbis', width: 680, height: 104,
    label: 'ANIMAÇÃO', labelSize: 13, labelLs: 0.18, labelW: 96,
    title: 'AGATHA CAÇANDO ZUMBIS', titleSize: 28, titleLs: 0.02, titleW: 495,
  },
];

function buildSvg(b, theme, fontRegular, fontBold) {
  const dark = theme === 'dark';
  const bg = dark ? '#141418' : '#f6f8fa';
  const titleColor = dark ? '#f4f1e8' : '#0c0c0f';
  const ruleColor = dark ? '#2a2a31' : '#d3d9df';
  const label = '#ff3b21';

  const labelY = 32;
  const titleY = b.height - (b.id === 'titulo-nome' ? 30 : 22);
  const ruleY = b.height - (b.id === 'titulo-nome' ? 10 : 8);
  const cx = b.width / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${b.width} ${b.height}" width="${b.width}" height="${b.height}" role="img" aria-label="${b.label}: ${b.title}">
<defs>
<style>
@font-face { font-family:'Silkscreen'; font-weight:400; src:url(${fontRegular}) format('woff2'); }
@font-face { font-family:'Silkscreen'; font-weight:700; src:url(${fontBold}) format('woff2'); }
text{ font-family:'Silkscreen', 'Courier New', monospace; }
</style>
</defs>
<rect x="0" y="0" width="${b.width}" height="${b.height}" fill="${bg}"/>
<text x="${cx}" y="${labelY}" text-anchor="middle" font-weight="400" font-size="${b.labelSize}" letter-spacing="${b.labelLs}em" fill="${label}">${b.label}</text>
<text x="${cx}" y="${titleY}" text-anchor="middle" font-weight="700" font-size="${b.titleSize}" letter-spacing="${b.titleLs}em" fill="${titleColor}">${b.title}</text>
<rect x="0" y="${ruleY}" width="${b.width}" height="1" fill="${ruleColor}"/>
</svg>`;
}

async function main() {
  const fontRegular = await fontDataUri('../assets/fonts/Silkscreen-Regular.woff2', 'font/woff2');
  const fontBold = await fontDataUri('../assets/fonts/Silkscreen-Bold.woff2', 'font/woff2');

  for (const b of BANNERS) {
    for (const theme of ['light', 'dark']) {
      const svg = buildSvg(b, theme, fontRegular, fontBold);
      const suffix = theme === 'dark' ? '-dark' : '';
      await writeFile(new URL(`../assets/${b.id}${suffix}.svg`, import.meta.url), svg);
    }
  }
  console.log(`Gerados ${BANNERS.length * 2} banners em assets/titulo-*.svg`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
