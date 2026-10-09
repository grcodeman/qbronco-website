// Before/after screenshots of a visible change: the same part of a page on
// main (or another git ref) and on your working copy, at desktop and phone
// widths, in one image. Run with
//
//   npm run compare -- <path> [<part>] [--base <git ref>] [--at <ISO time>]
//
//   npm run compare -- / "@work with us"
//   npm run compare -- /schedule footer --at 2026-10-12T12:00:00-04:00
//
// <part> is a CSS selector, or "@heading" for the section under that h2.
// Leave it off for the whole page. --base defaults to origin/main, and --at
// freezes the clock so the sticky note matches on both sides. It prints where
// the image went.
import { chromium, devices } from "@playwright/test";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args.splice(args.indexOf(name), 2)[1] : undefined);
const base = flag("--base") ?? "origin/main";
const at = flag("--at");
const [path, part] = args;
if (!path?.startsWith("/")) {
  console.error('usage: npm run compare -- <path> [<css selector> | "@heading"] [--base <git ref>] [--at <ISO time>]');
  process.exit(1);
}

const root = fileURLToPath(new URL("..", import.meta.url));
const astro = join("node_modules", "astro", "bin", "astro.mjs");
const out = join(tmpdir(), `compare${path.replace(/\W+/g, "-")}${part ? "-" + part.replace(/\W+/g, "-") : ""}.png`.replace(/-+/g, "-"));

// build the base ref in a throwaway worktree, sharing this checkout's node_modules
const worktree = mkdtempSync(join(tmpdir(), "qbronco-base-"));
const run = (cmd, argv, cwd) => execFileSync(cmd, argv, { cwd, stdio: ["ignore", "ignore", "inherit"] });
run("git", ["worktree", "add", "--detach", worktree, base], root);
symlinkSync(join(root, "node_modules"), join(worktree, "node_modules"));
console.log(`building ${base} and the working copy...`);
run(process.execPath, [astro, "build"], worktree);
run(process.execPath, [astro, "build"], root);

const SITES = [
  ["before", worktree, 4350],
  ["after", root, 4351],
];
const servers = SITES.map(([, cwd, port]) =>
  spawn(process.execPath, [astro, "preview", "--port", String(port)], { cwd, stdio: "ignore" }),
);
const { defaultBrowserType, ...pixel } = devices["Pixel 7"];
const VIEWS = {
  desktop: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5 },
  phone: { ...pixel, deviceScaleFactor: 2 },
};

const browser = await chromium.launch();
try {
  for (const [, , port] of SITES) {
    for (let tries = 0; ; tries++) {
      try {
        if ((await fetch(`http://localhost:${port}`)).ok) break;
      } catch {}
      if (tries > 100) throw new Error(`preview server never came up on port ${port}`);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const shot = async (port, view) => {
    const page = await browser.newPage(VIEWS[view]);
    if (at) await page.clock.setFixedTime(new Date(at));
    await page.goto(`http://localhost:${port}${path}`);
    await page.evaluate(() => document.querySelectorAll("img").forEach((img) => (img.loading = "eager")));
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => document.fonts.ready);
    // stretch the window to the whole page first: measuring and then taking a
    // full-page screenshot would move things after they were measured
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width: page.viewportSize().width, height });
    const box = await page.evaluate((part) => {
      const sheet = document.querySelector(".page").getBoundingClientRect();
      let el = document.body;
      if (part?.startsWith("@")) {
        const text = part.slice(1).toLowerCase();
        el = [...document.querySelectorAll("h2")].find((h) => h.textContent.trim().toLowerCase() === text)?.closest("section");
      } else if (part) {
        el = document.querySelector(part);
      }
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: sheet.left, y: Math.max(0, r.top - 12), width: sheet.width, height: r.height + 24 };
    }, part);
    const png = box && (await page.screenshot({ clip: box }));
    await page.close();
    return png && `data:image/png;base64,${png.toString("base64")}`;
  };

  const cells = [];
  for (const view of ["desktop", "phone"]) {
    for (const [side, , port] of SITES) cells.push({ label: `${view} · ${side}`, src: await shot(port, view), width: view === "desktop" ? 560 : 290 });
  }

  const page = await browser.newPage({ viewport: { width: 1800, height: 900 } });
  await page.setContent(`<body style="margin:0;padding:18px;background:#e9e5da;font:600 14px system-ui;color:#444;width:max-content">
    <div style="font-size:16px;margin:0 0 12px">${path}${part ? ` · ${part}` : ""} · before = ${base}, after = working copy</div>
    <div style="display:grid;grid-template-columns:repeat(4,auto);gap:8px 18px;align-items:start">
      ${cells.map((c) => `<div>${c.label}</div>`).join("")}
      ${cells
        .map((c) =>
          c.src
            ? `<img src="${c.src}" style="width:${c.width}px;display:block;box-shadow:0 1px 6px rgba(0,0,0,.18)">`
            : `<div style="width:${c.width}px;color:#888;font-weight:400">(not on this side)</div>`,
        )
        .join("")}
    </div></body>`);
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
  await page.screenshot({ path: out, fullPage: true });
  console.log(`compare: ${out}`);
} finally {
  await browser.close();
  servers.forEach((s) => s.kill());
  run("git", ["worktree", "remove", "--force", worktree], root);
  rmSync(worktree, { recursive: true, force: true });
}
