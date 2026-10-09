// Screenshots the "who's running this" section at desktop and phone widths,
// side by side in one image, to check (and show) the officers after a change.
// Run with `npm run officers-screenshot`, which builds the site first; it
// prints where the image went.
//
// The section is taller than a phone screen, and a plain element screenshot
// stops at the bottom of the screen. So the window is first stretched to the
// whole page's height (a full-page screenshot does the same, but after the
// section has been measured, which moves it), then the section is measured
// and cut out.
import { chromium, devices } from "@playwright/test";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = 4324;
const BASE = `http://localhost:${PORT}`;
const out = join(tmpdir(), "officers.png");

const { defaultBrowserType, ...pixel } = devices["Pixel 7"];
const VIEWS = [
  ["desktop", { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 }],
  ["phone", pixel],
];

const astro = fileURLToPath(new URL("../node_modules/astro/bin/astro.mjs", import.meta.url));
const server = spawn(process.execPath, [astro, "preview", "--port", String(PORT)], { stdio: "ignore" });
const browser = await chromium.launch();
try {
  for (let tries = 0; ; tries++) {
    try {
      if ((await fetch(BASE)).ok) break;
    } catch {}
    if (tries > 100) throw new Error(`preview server never came up on ${BASE}`);
    await new Promise((r) => setTimeout(r, 200));
  }

  const shots = [];
  for (const [name, use] of VIEWS) {
    const page = await browser.newPage(use);
    await page.goto(BASE);
    // the headshots load lazily; load them all before the picture
    await page.evaluate(() => document.querySelectorAll(".officers img").forEach((img) => (img.loading = "eager")));
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    const full = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: page.viewportSize().width, height: full });
    const box = await page.evaluate(() => {
      const b = document.querySelector(".officers").closest("section").getBoundingClientRect();
      return { x: b.left + scrollX, y: b.top + scrollY, width: b.width, height: b.height };
    });
    const pad = 16;
    const png = await page.screenshot({
      clip: { x: Math.max(0, box.x - pad), y: box.y - pad, width: box.width + 2 * pad, height: box.height + 2 * pad },
    });
    shots.push({ name, src: `data:image/png;base64,${png.toString("base64")}` });
    await page.close();
  }

  // both views at the same height, labelled
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.setContent(`<body style="margin:0;padding:20px;background:#ece8dc;display:flex;gap:28px;align-items:flex-start;font:600 15px system-ui;color:#555;width:max-content">${shots
    .map((s) => `<figure style="margin:0"><figcaption style="margin:0 0 8px">${s.name}</figcaption><img src="${s.src}" style="height:820px;display:block;box-shadow:0 2px 10px rgba(0,0,0,.15)"></figure>`)
    .join("")}</body>`);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  await page.screenshot({ path: out, fullPage: true });
  console.log(`officers screenshot: ${out}`);
} finally {
  await browser.close();
  server.kill();
}
