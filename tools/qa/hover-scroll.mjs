/** Full-row hover fills ([data-fill]) vs scrolling, on the home services rows.
 *  A: resting pointer while wheeling: nothing fills.       B: pointer moved onto a row mid-scroll: fills.
 *  C: first hover after the scroll settles: fills.          D: trackpad inertia (wheel ticks keep coming
 *  while the pointer moves): the row under the pointer fills and stays filled.
 *  E: a filled row scrolled away from a resting pointer: goes dark, the row now under it stays dark.
 *  Usage: `astro preview`, then `node tools/qa/hover-scroll.mjs [baseUrl]`. Exits 1 on failure. */
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:4321";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => sessionStorage.setItem("pg-preloaded", "1"));
await p.goto(`${BASE}/`); await p.waitForTimeout(6000);

// Settled fill of each row (scaleY of the ::before: 1 = black) and which rows are [data-hot].
const fill = () => p.evaluate(() => [...document.querySelectorAll(".service__link")].map((l) => {
  const m = getComputedStyle(l, "::before").transform; return m === "none" ? 1 : Math.round(+m.split(",")[3]); }));
const peak = async (fn) => {
  const max = [0, 0, 0];
  await p.evaluate(() => { window.__hot = [0, 0, 0]; window.__o = new MutationObserver(() =>
    document.querySelectorAll(".service__link").forEach((l, i) => { if (l.hasAttribute("data-hot")) window.__hot[i] = 1; }));
    window.__o.observe(document.body, { subtree: true, attributeFilter: ["data-hot"] }); });
  await fn();
  (await p.evaluate(() => { window.__o.disconnect(); return window.__hot; })).forEach((v, i) => max[i] = v);
  return max;
};
const rowY = (i) => p.evaluate((i) => { const r = document.querySelectorAll(".service__link")[i].getBoundingClientRect(); return r.y + r.height / 2; }, i);
const results = [];
const check = (name, ok, info) => { results.push(ok); console.log(ok ? "ok  " : "FAIL", name, JSON.stringify(info)); };

const top = await p.evaluate(() => document.querySelector("#services").getBoundingClientRect().top + scrollY);
await p.mouse.move(720, 500);
for (let y = 0; y < top - 300; y += 100) { await p.mouse.wheel(0, 100); await p.waitForTimeout(40); }

// A
const a = await peak(async () => { for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(60); } await p.waitForTimeout(1500); });
check("A resting pointer while wheeling", a.every((v) => !v) && (await fill()).every((v) => !v), { hotEver: a });

// B
await p.mouse.wheel(0, -150); await p.waitForTimeout(120);
await p.mouse.move(400, await rowY(1), { steps: 6 }); await p.waitForTimeout(900);
const bHot = await p.evaluate(() => [...document.querySelectorAll(".service__link")].map((l) => l.hasAttribute("data-hot")));
check("B pointer moved onto row mid-scroll", bHot.filter(Boolean).length === 1, { hot: bHot });

// C
await p.waitForTimeout(1200); await p.mouse.move(720, 20, { steps: 4 }); await p.waitForTimeout(700);
await p.mouse.move(400, await rowY(0), { steps: 6 }); await p.waitForTimeout(700);
check("C first hover after settle", (await fill())[0] === 1, { fill: await fill() });

// D: inertia ticks interleaved with pointer movement, then pointer rests on a row
for (let i = 0; i < 14; i++) { await p.mouse.wheel(0, 30 - i * 2); await p.mouse.move(400 + i * 12, 450 + (i % 2), { steps: 2 }); await p.waitForTimeout(30); }
await p.mouse.move(600, await rowY(1), { steps: 4 }); await p.waitForTimeout(900);
const d = await fill();
check("D trackpad inertia + moving pointer", d[1] === 1 && d.filter(Boolean).length === 1, { fill: d });

// E: scroll the filled row away without moving the pointer
const e = await peak(async () => { for (let i = 0; i < 4; i++) { await p.mouse.wheel(0, 80); await p.waitForTimeout(60); } await p.waitForTimeout(1500); });
const eFill = await fill();
check("E filled row scrolled away from resting pointer", eFill.every((v) => !v), { fill: eFill, hotEver: e });

await b.close();
process.exit(results.every(Boolean) ? 0 : 1);
