// Rebuilds the assets of the coachmaitefinch.com slide in the home Work stage, from the live site:
//   src/assets/work/coachmaitefinch.webp   the screenshot of the live layer
//   src/data/work-stage/coachmaitefinch.json   the hero's geometry, for the plot and build layers
// Re-run it when the site's hero changes. Usage: node tools/work/coachmaitefinch.mjs
//
// The viewport is 1600×1000: 8:5 like the stage, the whole hero fits, and 1 stage unit = 2 CSS px.
// Text is converted to outlines so the home page does not load this site's fonts.
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";
import * as fontkit from "fontkit";
import sharp from "sharp";

const URL_LIVE = "https://coachmaitefinch.com";
// The same families the site uses, as variable TTFs: fontkit cannot build variations of a WOFF2.
const GF = "https://raw.githubusercontent.com/google/fonts/main/ofl/";
const root = new URL("../../", import.meta.url).pathname;
const VW = 1600;
const VH = 1000;
const DPR = 1.25;
const K = 0.5;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: DPR });
const page = await ctx.newPage();
await page.goto(URL_LIVE, { waitUntil: "load", timeout: 45000 });
await page.waitForTimeout(2500);
await page.getByRole("button", { name: "Denegar" }).first().click();
// The seal spins: stop it at 0° so the drawing and the screenshot agree.
await page.addStyleTag({ content: ".hero__badge-ring { animation: none !important; transform: none !important; }" });
await page.waitForTimeout(6000);
const png = await page.screenshot();

const m = await page.evaluate(() => {
  const canvas = document.createElement("canvas").getContext("2d");
  const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const firstText = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) if (w.currentNode.textContent.trim()) return w.currentNode;
    return null;
  };
  /** Text with the position of its baseline: a Range measures the font's content area. */
  const text = (el) => {
    const node = firstText(el);
    const cs = getComputedStyle(node.parentElement);
    const range = document.createRange();
    const raw = node.textContent;
    range.setStart(node, raw.length - raw.trimStart().length);
    range.setEnd(node, raw.trimEnd().length);
    const r = range.getBoundingClientRect();
    const family = cs.fontFamily.split(",")[0].replace(/"/g, "");
    canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} "${family}"`;
    const value = raw.trim().replace(/\s+/g, " ");
    return {
      text: cs.textTransform === "uppercase" ? value.toUpperCase() : value,
      x: r.left,
      y: r.top + canvas.measureText("x").fontBoundingBoxAscent,
      family,
      italic: cs.fontStyle === "italic",
      size: parseFloat(cs.fontSize),
      weight: parseFloat(cs.fontWeight),
      stretch: Number(/"wdth"\s+([\d.]+)/.exec(cs.fontVariationSettings)?.[1]) || parseFloat(cs.fontStretch) || 100,
      width: r.width,
      spacing: parseFloat(cs.letterSpacing) || 0,
    };
  };
  const by = (sel, re) => [...document.querySelectorAll(sel)].find((e) => re.test(e.textContent));
  const h1 = document.querySelector("h1");
  const words = [...h1.querySelectorAll("span, em")].filter((e) => e.children.length === 0 && e.textContent.trim());
  const menu = by("header button, header a", /Menú/);
  const ring = document.querySelector(".hero__badge-ring");
  const ringText = ring.querySelector("text");
  const ringCs = getComputedStyle(ringText);
  const eyebrow = by("main p", /Maite Finch, psic/);
  const lead = by("main p", /Te acompa/);
  const range = document.createRange();
  range.selectNodeContents(lead);
  const cta = by("main a", /Empecemos/);
  const book = by("header a", /Reserva/);
  const scrollLink = by("main a, main button", /Desliza/);
  return {
    words: words.map((e) => ({ ...text(e), em: e.tagName === "EM" })),
    scribble: { ...box(h1.querySelector("svg")), stroke: getComputedStyle(h1.querySelector("svg path")).stroke, width: parseFloat(getComputedStyle(h1.querySelector("svg path")).strokeWidth), effect: getComputedStyle(h1.querySelector("svg path")).vectorEffect, cap: getComputedStyle(h1.querySelector("svg path")).strokeLinecap },
    nav: ["Servicios", "Sobre mí", "Metodología", "Blog"].map((t) => text(by("header a", new RegExp(t)))),
    book: { box: box(book), label: text(book) },
    cta: { box: box(cta), label: text(cta), arrow: box(cta.querySelector("svg")) },
    menu: { label: text(menu), bars: [...menu.querySelectorAll("span, i")].filter((e) => !e.textContent.trim() && e.getBoundingClientRect().height < 4).map(box) },
    search: box(document.querySelector("header svg")),
    logo: box(document.querySelector("header img")),
    eyebrow: { ...text(eyebrow), inset: parseFloat(getComputedStyle(eyebrow).paddingLeft) || 0 },
    lead: [...range.getClientRects()].map((r) => ({ x: r.left, y: r.top, w: r.width, h: r.height })),
    scroll: scrollLink ? text(scrollLink) : null,
    seal: { box: box(ring), text: ringText.textContent.trim().toUpperCase() + " ", size: parseFloat(ringCs.fontSize), family: ringCs.fontFamily.split(",")[0].replace(/"/g, ""), weight: parseFloat(ringCs.fontWeight), stretch: 100 },
    guillemets: text(by(".hero__badge span, .hero__badge div", /«/)),
  };
});
await browser.close();

/* ── outlines ─────────────────────────────────────────────── */

const FILES = {
  "Instrument Sans Variable": "instrumentsans/InstrumentSans%5Bwdth,wght%5D.ttf",
  "Instrument Serif": "instrumentserif/InstrumentSerif-Italic.ttf",
  "Geist Variable": "geist/Geist%5Bwght%5D.ttf",
};
const cache = new Map();
function fontFor(family, weight, stretch) {
  const file = FILES[family];
  if (!file) throw new Error(`No font file for ${family}`);
  const key = `${family}/${weight}/${stretch}`;
  if (!cache.has(key)) {
    cache.set(key, fetch(GF + file).then(async (res) => {
      if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
      const font = fontkit.create(Buffer.from(await res.arrayBuffer()));
      const axes = font.variationAxes ?? {};
      const coords = {};
      if (axes.wght) coords.wght = weight;
      if (axes.wdth) coords.wdth = stretch;
      return Object.keys(coords).length ? font.getVariation(coords) : font;
    }));
  }
  return cache.get(key);
}

/** "12 -3.4 .5": the shortest separators SVG allows; values are in tenths of a stage unit. */
const nums = (list) => list.map((n, i) => {
  const v = String(n / 10).replace(/^(-?)0\./, "$1.");
  return i && n >= 0 ? ` ${v}` : v;
}).join("");

/** One glyph, placed by (x, y, angle) in px, as a path in stage units with relative commands (a third lighter). */
function glyphPath(glyph, scale, x, y, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const pt = (px, py) => {
    const gx = px * scale;
    const gy = -py * scale;
    return [Math.round((x + gx * cos - gy * sin) * K * 10), Math.round((y + gx * sin + gy * cos) * K * 10)];
  };
  let cur = [0, 0];
  let start = [0, 0];
  const rel = (points) => {
    const out = points.flatMap(([px, py]) => [px - cur[0], py - cur[1]]);
    cur = points[points.length - 1];
    return nums(out);
  };
  return glyph.path.commands.map(({ command, args: a }) => {
    if (command === "moveTo") {
      cur = start = pt(a[0], a[1]);
      return `M${nums(cur)}`;
    }
    if (command === "lineTo") return `l${rel([pt(a[0], a[1])])}`;
    if (command === "quadraticCurveTo") return `q${relCurve(rel, pt, a)}`;
    if (command === "bezierCurveTo") return `c${relCurve(rel, pt, a)}`;
    cur = start;
    return "z";
  }).join("");
}

/** Curve control points are relative to the curve's start, so they go in together. */
function relCurve(rel, pt, a) {
  const points = [];
  for (let i = 0; i < a.length; i += 2) points.push(pt(a[i], a[i + 1]));
  return rel(points);
}

async function outline(t) {
  const font = await fontFor(t.family, t.weight, t.stretch);
  const scale = t.size / font.unitsPerEm;
  const run = font.layout(t.text);
  let x = t.x;
  let d = "";
  run.glyphs.forEach((glyph, i) => {
    const p = run.positions[i];
    d += glyphPath(glyph, scale, x + p.xOffset * scale, t.y - p.yOffset * scale, 0);
    x += p.xAdvance * scale + t.spacing;
  });
  // The outlines must match what the browser set: warn when a word comes out wider or narrower.
  const drift = x - t.x - t.width;
  if (Math.abs(drift) > 2) console.warn(`drift ${drift.toFixed(1)} px: "${t.text}" (${t.family} ${t.weight}/${t.stretch})`);
  return d;
}

/** The seal's text on its circle (r 78 in a 200-unit box, starting at 9 o'clock, clockwise, 488 long). */
async function sealOutline(s) {
  const font = await fontFor(s.family, s.weight, s.stretch);
  const scale = s.size / font.unitsPerEm;
  const run = font.layout(s.text);
  const advances = run.positions.map((p) => p.xAdvance * scale);
  const extra = (488 - advances.reduce((a, b) => a + b, 0)) / advances.length;
  const unit = s.box.w / 200;
  let along = 0;
  let d = "";
  run.glyphs.forEach((glyph, i) => {
    const mid = along + advances[i] / 2;
    const theta = Math.PI + mid / 78;
    const rot = theta + Math.PI / 2;
    const cx = 100 + 78 * Math.cos(theta) - (advances[i] / 2) * Math.cos(rot);
    const cy = 100 + 78 * Math.sin(theta) - (advances[i] / 2) * Math.sin(rot);
    d += glyphPath(glyph, scale * unit, s.box.x + cx * unit, s.box.y + cy * unit, rot);
    along += advances[i] + extra;
  });
  return d;
}

/* ── output ───────────────────────────────────────────────── */

const half = (r) => ({ x: +(r.x * K).toFixed(1), y: +(r.y * K).toFixed(1), w: +(r.w * K).toFixed(1), h: +(r.h * K).toFixed(1) });

// The four lines of the headline, grouped by baseline; the words sit at different baselines only per line.
const words = await Promise.all(m.words.map(async (w) => ({ text: w.text, em: w.em, x: +(w.x * K).toFixed(1), y: +(w.y * K).toFixed(1), d: await outline(w) })));
const baselines = [];
for (const w of m.words) {
  const y = +(w.y * K).toFixed(1);
  if (!baselines.some((b) => Math.abs(b.y - y) < 12)) baselines.push({ y, x: +(w.x * K).toFixed(1) });
}

const logoCrop = await sharp(png)
  .extract({ left: Math.round(m.logo.x * DPR), top: Math.round(m.logo.y * DPR), width: Math.round(m.logo.w * DPR), height: Math.round(m.logo.h * DPR) })
  .webp({ quality: 80 })
  .toBuffer();

const data = {
  words,
  baselines,
  scribble: { ...half(m.scribble), stroke: m.scribble.stroke, width: m.scribble.width, effect: m.scribble.effect, cap: m.scribble.cap },
  nav: await Promise.all(m.nav.map((t) => outline(t))),
  navBoxes: m.nav.map((t) => ({ x: +(t.x * K).toFixed(1), y: +(t.y * K).toFixed(1) })),
  book: { box: half(m.book.box), d: await outline(m.book.label) },
  cta: { box: half(m.cta.box), d: await outline(m.cta.label), arrow: half(m.cta.arrow) },
  menu: { d: await outline(m.menu.label), bars: m.menu.bars.map(half) },
  search: half(m.search),
  logo: { ...half(m.logo), src: `data:image/webp;base64,${logoCrop.toString("base64")}` },
  eyebrow: { d: await outline(m.eyebrow), x: +(m.eyebrow.x * K).toFixed(1), y: +(m.eyebrow.y * K).toFixed(1) },
  lead: m.lead.map(half),
  scroll: m.scroll ? await outline(m.scroll) : null,
  seal: { box: half(m.seal.box), d: await sealOutline(m.seal), guillemets: await outline(m.guillemets) },
};

mkdirSync(`${root}src/assets/work`, { recursive: true });
mkdirSync(`${root}src/data/work-stage`, { recursive: true });
await sharp(png).webp({ quality: 92 }).toFile(`${root}src/assets/work/coachmaitefinch.webp`);
writeFileSync(`${root}src/data/work-stage/coachmaitefinch.json`, JSON.stringify(data));
console.log({ stretch: m.words[0].stretch, scribble: data.scribble, ringFont: m.seal.size, words: words.map((w) => `${w.text} ${w.x},${w.y}`), baselines, guillemets: m.guillemets.family, seal: m.seal.family, bars: m.menu.bars.length, json: JSON.stringify(data).length, logo: logoCrop.length });
