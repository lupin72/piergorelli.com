// WCAG 2.1 AA audit with axe-core on every page of the sitemap, in both themes and all three accents.
// Needs `astro preview` (default :4330). Usage: `pnpm qa:a11y` · QA_URL, QA_PATHS="/,/about/" to narrow.
// Runs with reduced motion so the audit sees the final state of every effect (no half-inked titles);
// QA_MOTION=no-preference audits the animated pages after their intro (QA_WAIT ms, default 5000).
// Exits 1 if any violation is found.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright-core";

const base = process.env.QA_URL ?? "http://localhost:4330";
const axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");

const sitemap = await fetch(`${base}/sitemap-0.xml`).then((r) => r.text());
let paths = [...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
paths.push("/404/", "/contact/thanks/");
if (process.env.QA_PATHS) paths = process.env.QA_PATHS.split(",");

const combos = [
  ["light", "blue"], ["dark", "blue"],
  ["light", "orange"], ["dark", "orange"],
  ["light", "lime"], ["dark", "lime"],
];
const widths = [1440, 390];
const motion = process.env.QA_MOTION ?? "reduce";
const wait = motion === "reduce" ? 400 : Number(process.env.QA_WAIT ?? 5000);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const found = new Map(); // rule → { impact, help, nodes: Map<"target · detail", Set<"path w theme/accent">> }

for (const w of widths) {
  for (const [theme, accent] of combos) {
    // Mobile only in the default accent: layout issues don't depend on the accent.
    if (w < 1000 && accent !== "blue") continue;
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: motion });
    await ctx.addInitScript(([t, a]) => {
      localStorage.setItem("pg-theme", t);
      localStorage.setItem("pg-accent", a);
      sessionStorage.setItem("pg-preloaded", "1");
    }, [theme, accent]);
    const page = await ctx.newPage();
    for (const path of paths) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.waitForTimeout(wait);
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(() =>
        window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
          resultTypes: ["violations"],
        }),
      );
      for (const v of res.violations) {
        const entry = found.get(v.id) ?? { impact: v.impact, help: v.help, tags: v.tags, nodes: new Map() };
        for (const n of v.nodes) {
          const detail = (n.any[0]?.message ?? n.failureSummary?.split("\n")[1] ?? "").replace(/\. Expected.*/, "");
          const key = `${n.target.join(" ").replace(/\[data-astro-cid-\w+(="")?\]/g, "")} · ${detail.slice(0, 170)}`;
          const where = entry.nodes.get(key) ?? new Set();
          where.add(`${path} ${w} ${theme}/${accent}`);
          entry.nodes.set(key, where);
        }
        found.set(v.id, entry);
      }
    }
    await ctx.close();
  }
}
await browser.close();

if (!found.size) {
  console.log(`axe: 0 violations on ${paths.length} pages`);
  process.exit(0);
}
for (const [id, e] of found) {
  const wcag = e.tags.filter((t) => /^wcag\d/.test(t)).join(",") || "best-practice";
  console.log(`\n■ ${id} [${e.impact}] (${wcag}) ${e.help}: ${e.nodes.size} distinct`);
  for (const [n, where] of [...e.nodes].slice(0, Number(process.env.QA_MAX ?? 60))) {
    const list = [...where];
    console.log(`   ${n}\n      ↳ ${list.length}× e.g. ${list.slice(0, 3).join(", ")}`);
  }
}
process.exit(1);
