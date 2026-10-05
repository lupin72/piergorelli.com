// Mobile menu (⌘K palette): theme/accent actions keep the search focused, so its accent underline stays. QA_URL defaults to :4321 (dev).
import { chromium } from "playwright-core";
const base = process.env.QA_URL ?? "http://localhost:4321";
const out = new URL("./out/", import.meta.url).pathname;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
await page.goto(base + "/about/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
await page.locator(".tool--menu").tap();
await page.waitForTimeout(900);
const state = () => page.evaluate(() => ({
  focus: document.activeElement?.tagName + "." + document.activeElement?.className,
  line: getComputedStyle(document.querySelector(".palette__search")).boxShadow,
}));
console.log("open  ", await state());
await page.screenshot({ path: out + "menu-actions_0.png" });
for (const [i, label] of ["Toggle light / dark", "Next accent colour"].entries()) {
  await page.locator(".palette__list [role=option]", { hasText: label }).tap();
  await page.waitForTimeout(400);
  console.log(label.padEnd(20), await state());
  await page.screenshot({ path: out + `menu-actions_${i + 1}.png` });
}
await browser.close();
