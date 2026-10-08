// Makes the picture at the top of the README (docs/screenshots/home.webp):
// the home page on a monitor with a phone in front of it. Run with
// `npm run screenshots`, which builds the site first.
//
// It serves the built site, screenshots the home page at a desktop size and a
// phone size, drops both into the device frames in scripts/readme/devices.html
// and photographs that. The clock is frozen on a meeting day before the
// meeting starts, so the sticky note reads "tonight!" whenever this is run.
import { chromium, devices } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const PORT = 4323;
const BASE = `http://localhost:${PORT}`;
const WHEN = "2026-10-14T16:00:00-04:00";
const frames = pathToFileURL(fileURLToPath(new URL("./readme/devices.html", import.meta.url))).href;
const out = fileURLToPath(new URL("../docs/screenshots/home.webp", import.meta.url));

// an iPhone 15's screen is 393 x 852 points; the status bar drawn in the frame
// takes the top 54, which leaves 798 for the page
const { defaultBrowserType, ...iphone } = devices["iPhone 15"];
const SHOTS = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 },
  phone: { ...iphone, viewport: { width: 393, height: 798 }, deviceScaleFactor: 3 },
};

const astro = fileURLToPath(new URL("../node_modules/astro/bin/astro.mjs", import.meta.url));
const server = spawn(process.execPath, [astro, "preview", "--port", String(PORT)], { stdio: "ignore" });
const browser = await chromium.launch();
try {
  // wait for the preview server to answer
  for (let tries = 0; ; tries++) {
    try {
      if ((await fetch(BASE)).ok) break;
    } catch {}
    if (tries > 100) throw new Error(`preview server never came up on ${BASE}`);
    await new Promise((r) => setTimeout(r, 200));
  }

  const shots = {};
  for (const [name, use] of Object.entries(SHOTS)) {
    const page = await browser.newPage(use);
    await page.clock.setFixedTime(new Date(WHEN));
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    shots[name] = `data:image/png;base64,${(await page.screenshot()).toString("base64")}`;
    await page.close();
  }

  // the two screenshots in their frames, on a transparent background so the
  // rounded corners work on GitHub's light and dark themes
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1.5 });
  await page.goto(frames);
  await page.evaluate(async (shots) => {
    for (const [id, src] of Object.entries(shots)) {
      const img = document.getElementById(id);
      img.src = src;
      await img.decode();
    }
  }, shots);
  const png = await page.locator(".stage").screenshot({ omitBackground: true });

  // Playwright only writes PNG and JPEG, and JPEG has no transparency, so the
  // browser re-encodes it as WebP
  const webp = await page.evaluate(async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height });
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/webp", 0.86).split(",")[1];
  }, `data:image/png;base64,${png.toString("base64")}`);

  mkdirSync(fileURLToPath(new URL("../docs/screenshots/", import.meta.url)), { recursive: true });
  writeFileSync(out, Buffer.from(webp, "base64"));
  console.log("wrote docs/screenshots/home.webp");
} finally {
  await browser.close();
  server.kill();
}
