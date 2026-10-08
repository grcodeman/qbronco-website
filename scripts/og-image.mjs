// Renders scripts/og/card.html to public/og.jpg (the 1200x630 image shown when
// someone shares a qbronco.com link). Run with `npm run og`.
import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";

const card = fileURLToPath(new URL("./og/card.html", import.meta.url));
const out = fileURLToPath(new URL("../public/og.jpg", import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(card).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out, type: "jpeg", quality: 86 });
await browser.close();
console.log(`wrote ${out}`);
