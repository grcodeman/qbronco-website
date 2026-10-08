// Makes an officer's headshot from any photo:
//   public/officers/<slug>-160.webp and <slug>-320.webp
// and a preview of it circled next to everyone else's, to check the framing.
//
//   npm run officer-photo -- <photo> <slug> [--crop left,top,size]
//
// --crop is a square in the photo's own pixels. Leave it off the first time:
// the script takes the biggest square that fits, centred side to side, and
// prints the photo's size so you can pick a better square and run it again.
// See docs/adding-an-officer.md for what a good crop looks like.
import { chromium } from "@playwright/test";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SIZES = [160, 320];
const TYPES = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

const [photo, slug, ...rest] = process.argv.slice(2);
const cropArg = rest[rest.indexOf("--crop") + 1];
const type = photo && TYPES[extname(photo).toLowerCase()];
if (!photo || !slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || !type || (rest.includes("--crop") && !cropArg)) {
  console.error(
    "usage: npm run officer-photo -- <photo.jpg|png|webp> <first-last> [--crop left,top,size]\n" +
      "  slug: lowercase first-last, e.g. kaiden-rudolph",
  );
  process.exit(1);
}

const officers = fileURLToPath(new URL("../public/officers/", import.meta.url));
const src = `data:${type};base64,${readFileSync(photo).toString("base64")}`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const result = await page.evaluate(
    async ({ src, cropArg, sizes }) => {
      const img = new Image();
      img.src = src;
      await img.decode(); // the browser applies the photo's EXIF rotation
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      let [left, top, side] = cropArg ? cropArg.split(",").map(Number) : [];
      if (!cropArg) {
        side = Math.min(w, h);
        left = Math.round((w - side) / 2);
        top = 0;
      }
      if (![left, top, side].every(Number.isFinite) || left < 0 || top < 0 || side <= 0 || left + side > w || top + side > h) {
        return { error: `--crop ${cropArg} doesn't fit inside the ${w}x${h} photo` };
      }

      // shrink by halves first so the final step stays sharp
      let canvas = document.createElement("canvas");
      canvas.width = canvas.height = side;
      canvas.getContext("2d").drawImage(img, left, top, side, side, 0, 0, side, side);
      const out = {};
      for (const size of [...sizes].sort((a, b) => b - a)) {
        while (canvas.width / 2 >= size) {
          const half = Object.assign(document.createElement("canvas"), { width: canvas.width / 2, height: canvas.height / 2 });
          const ctx = half.getContext("2d");
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(canvas, 0, 0, half.width, half.height);
          canvas = half;
        }
        const final = Object.assign(document.createElement("canvas"), { width: size, height: size });
        const ctx = final.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(canvas, 0, 0, size, size);
        out[size] = final.toDataURL("image/webp", 0.82).split(",")[1];
      }
      return { w, h, crop: [left, top, side], out };
    },
    { src, cropArg, sizes: SIZES },
  );
  if (result.error) throw new Error(result.error);

  for (const size of SIZES) writeFileSync(join(officers, `${slug}-${size}.webp`), Buffer.from(result.out[size], "base64"));
  console.log(`photo is ${result.w}x${result.h}; used --crop ${result.crop.join(",")}`);
  console.log(`wrote public/officers/${slug}-160.webp and ${slug}-320.webp`);

  // everyone's headshot in a row, circled the way the site shows them
  const faces = readdirSync(officers)
    .filter((f) => f.endsWith("-320.webp"))
    .map((f) => ({ name: f.replace("-320.webp", ""), src: `data:image/webp;base64,${readFileSync(join(officers, f)).toString("base64")}` }));
  await page.setViewportSize({ width: 190 * faces.length + 20, height: 230 });
  await page.setContent(`<body style="margin:0;padding:16px 10px;background:#fcfbf4;display:flex;font:14px system-ui">${faces
    .map(
      (f) => `<figure style="margin:0 10px;text-align:center;color:${f.name === slug ? "#c2362f" : "#555"}">
        <img src="${f.src}" width="168" height="168" style="border-radius:50%;display:block;outline:${f.name === slug ? "3px solid #c2362f" : "1px solid #aaa"};outline-offset:3px">
        <figcaption style="margin-top:10px">${f.name}</figcaption></figure>`,
    )
    .join("")}</body>`);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())));
  const preview = join(tmpdir(), `officer-preview-${slug}.png`);
  await page.screenshot({ path: preview });
  console.log(`preview: ${preview}`);
} finally {
  await browser.close();
}
