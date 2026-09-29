// Screenshots of the accessibility fixes: focus ring (lime, light), form errors, accessibility page.
// Needs `astro preview`. Usage: QA_URL=http://localhost:4321 node tools/qa/a11y-shots.mjs
import { chromium } from "playwright-core";

const base = process.env.QA_URL ?? "http://localhost:4330";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctxFor = async (theme, accent, w = 1440) => {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, reducedMotion: "reduce" });
  await ctx.addInitScript(([t, a]) => {
    localStorage.setItem("pg-theme", t);
    localStorage.setItem("pg-accent", a);
    sessionStorage.setItem("pg-preloaded", "1");
  }, [theme, accent]);
  return ctx;
};

// 1. focus ring on the header with the lime accent (the lowest-contrast accent)
{
  const ctx = await ctxFor("light", "lime");
  const p = await ctx.newPage();
  await p.goto(base + "/", { waitUntil: "networkidle" });
  for (let i = 0; i < 3; i++) await p.keyboard.press("Tab");
  await p.waitForTimeout(200);
  await p.screenshot({ path: out + "a11y-focus-lime.png", clip: { x: 0, y: 0, width: 1440, height: 120 } });
  await ctx.close();
}

// 2. form errors after submitting an incomplete brief (light + dark)
for (const theme of ["light", "dark"]) {
  const ctx = await ctxFor(theme, "orange");
  const p = await ctx.newPage();
  await p.goto(base + "/contact/", { waitUntil: "networkidle" });
  await p.fill("#f-email", "ada@");
  await p.click("[data-brief-send]");
  await p.waitForTimeout(300);
  const state = await p.evaluate(() => ({
    focused: document.activeElement?.id,
    invalid: [...document.querySelectorAll("[aria-invalid=true]")].map((e) => `${e.id} → ${e.getAttribute("aria-describedby")}`),
  }));
  const form = await p.$("[data-brief]");
  await form.screenshot({ path: out + `a11y-form-errors-${theme}.png` });
  console.log(theme, state);
  await ctx.close();
}

// 3. accessibility statement
{
  const ctx = await ctxFor("light", "blue");
  const p = await ctx.newPage();
  await p.goto(base + "/accessibility/", { waitUntil: "networkidle" });
  await p.screenshot({ path: out + "a11y-statement.png", fullPage: true });
  await ctx.close();
}
await browser.close();
