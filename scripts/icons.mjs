// Makes the raster icons from the two sources in public/. Run with
// `npm run icons` after changing either one.
//
//   favicon.svg (the Bloch-sphere mark) -> favicon-32.png, favicon.ico
//     for browsers and crawlers that don't take SVG favicons
//   logo_transparent.png (the full badge) -> icon-192.png, icon-512.png
//     for site.webmanifest: the home-screen / installed-app icon. The badge
//     sits on notebook paper inside the middle 80% circle, so Android can
//     crop it to any shape (the "maskable" safe zone) without clipping it.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const pub = (name) => fileURLToPath(new URL(`../public/${name}`, import.meta.url));
const dataUrl = (name, type) => `data:${type};base64,${readFileSync(pub(name)).toString("base64")}`;

const PAPER = "#fcfbf4";
const BADGE = 400 / 512; // the badge's share of the icon, drawn at its own 400px on the 512

const browser = await chromium.launch();

async function render(size, body, { transparent = false } = {}) {
  const page = await browser.newPage({ viewport: { width: size, height: size }, colorScheme: "light" });
  await page.setContent(`<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${transparent ? "transparent" : PAPER}">${body}</body>`);
  await page.evaluate(() => Promise.all([...document.images].map((img) => img.decode())));
  const png = await page.screenshot({ omitBackground: transparent });
  await page.close();
  return png;
}

// favicon.svg, light ink, on a transparent square
const mark = dataUrl("favicon.svg", "image/svg+xml");
const markPng = (size) => render(size, `<img src="${mark}" width="${size}" height="${size}">`, { transparent: true });

const [ico16, ico32, ico48] = await Promise.all([markPng(16), markPng(32), markPng(48)]);
writeFileSync(pub("favicon-32.png"), ico32);
writeFileSync(pub("favicon.ico"), ico([[16, ico16], [32, ico32], [48, ico48]]));

// the badge on paper
const badge = dataUrl("logo_transparent.png", "image/png");
for (const size of [192, 512]) {
  const side = Math.round(size * BADGE);
  writeFileSync(pub(`icon-${size}.png`), await render(size, `<img src="${badge}" width="${side}" height="${side}">`));
}

await browser.close();
console.log("wrote favicon-32.png, favicon.ico, icon-192.png, icon-512.png");

// an .ico is a small directory of images; every browser since IE11 (and
// Windows since Vista) reads PNGs stored in it as-is
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0); // reserved
  head.writeUInt16LE(1, 2); // 1 = icon
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(([size, png], i) => {
    const at = 6 + 16 * i;
    head.writeUInt8(size, at); // width
    head.writeUInt8(size, at + 1); // height
    head.writeUInt8(0, at + 2); // no palette
    head.writeUInt8(0, at + 3); // reserved
    head.writeUInt16LE(1, at + 4); // colour planes
    head.writeUInt16LE(32, at + 6); // bits per pixel
    head.writeUInt32LE(png.length, at + 8);
    head.writeUInt32LE(offset, at + 12);
    offset += png.length;
  });
  return Buffer.concat([head, ...images.map(([, png]) => png)]);
}
