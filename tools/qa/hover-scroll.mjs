/** Hover fills vs wheel scrolling on the home services rows. A: resting pointer, no flicker.
 *  B: pointer moved onto a row during the smooth-scroll tail fills it. C: first hover after settle fills.
 *  Usage: `astro preview`, then `node tools/qa/hover-scroll.mjs <screenshot.png>`. */
import { chromium } from "playwright-core";
const b = await chromium.launch({ channel: "chrome", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => sessionStorage.setItem("pg-preloaded", "1"));
await p.goto("http://localhost:4321/"); await p.waitForTimeout(6000);
// fill = scaleY of the ::before (1 = black row filled)
const fill = () => p.evaluate(() => [...document.querySelectorAll(".service__link")].map((l) => {
  const m = getComputedStyle(l, "::before").transform; return m === "none" ? 1 : +(+m.split(",")[3]).toFixed(2); }));
const wheel = async (n) => { for (let i = 0; i < n; i++) { await p.mouse.wheel(0, 100); await p.waitForTimeout(40); } };
const top = await p.evaluate(() => document.querySelector("#services").getBoundingClientRect().top + scrollY);

// A: pointer resting mid-screen while wheeling through the rows
await p.mouse.move(720, 500);
await wheel(Math.round((top - 300) / 100));
let peak = [0, 0, 0];
for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(60); (await fill()).forEach((v, j) => peak[j] = Math.max(peak[j], v)); }
await p.waitForTimeout(1500);
console.log("A resting pointer, peak fill while wheeling:", peak, "after settle:", await fill(), await p.evaluate(() => document.documentElement.className.includes("is-wheeling")));

// B: pointer moves onto a row during the smooth-scroll tail
await p.mouse.wheel(0, -150); await p.waitForTimeout(120);
const r = await p.evaluate(() => { const b = document.querySelectorAll(".service__link")[1].getBoundingClientRect(); return { x: 400, y: b.y + b.height / 2 }; });
await p.mouse.move(r.x, r.y, { steps: 6 }); await p.waitForTimeout(700);
console.log("B moved onto row 2 during scroll tail:", await fill());

// C: after settle, leave and re-enter row 1 (first hover)
await p.waitForTimeout(1500); await p.mouse.move(720, 20, { steps: 4 }); await p.waitForTimeout(600);
const r1 = await p.evaluate(() => { const b = document.querySelectorAll(".service__link")[0].getBoundingClientRect(); return { y: b.y + b.height / 2 }; });
await p.mouse.move(400, r1.y, { steps: 6 }); await p.waitForTimeout(700);
console.log("C first hover on row 1 after settle:", await fill());
await p.screenshot({ path: process.argv[2] });
await b.close();
