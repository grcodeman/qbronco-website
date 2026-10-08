import { expect, test, type Page } from "@playwright/test";

// How the site looks to Google, link previews, and AI assistants: both names,
// structured data, Open Graph, llms.txt, robots.txt and the sitemap.

const jsonLd = (page: Page) =>
  page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.flatMap((el) => JSON.parse(el.textContent!)["@graph"]));

const meta = (page: Page, key: string) =>
  page.locator(`meta[property="${key}"], meta[name="${key}"]`).getAttribute("content");

test.describe("both names", () => {
  test("the home page title, description and wordmark carry QBronco and Quantum Broncos", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/QBronco/);
    await expect(page).toHaveTitle(/Quantum Broncos/);
    expect(await meta(page, "description")).toMatch(/QBronco.*Quantum Broncos/);
    await expect(page.locator(".title-row .aka")).toHaveText("a.k.a. Quantum Broncos");
  });

  test("structured data tells Google the site and club go by both names", async ({ page }) => {
    await page.goto("/");
    const graph = await jsonLd(page);
    const site = graph.find((n) => n["@type"] === "WebSite");
    const club = graph.find((n) => n["@type"] === "Organization");
    expect(site.name).toBe("QBronco");
    expect(site.alternateName).toContain("Quantum Broncos");
    expect(site.url).toBe("https://qbronco.com/");
    expect(club.alternateName).toContain("Quantum Broncos");
    expect(club.sameAs).toContain("https://www.instagram.com/qbroncowmu/");
    expect(club.parentOrganization.name).toBe("Western Michigan University");
  });

  test("every page title names the club both ways", async ({ page }) => {
    for (const path of ["/schedule", "/project"]) {
      await page.goto(path);
      await expect(page).toHaveTitle(/QBronco \(Quantum Broncos\)/);
    }
  });
});

test("link previews get a 1200x630 card with alt text on every page", async ({ page, request }) => {
  for (const path of ["/", "/schedule", "/project"]) {
    await page.goto(path);
    expect(await meta(page, "og:image")).toBe("https://qbronco.com/og.jpg");
    expect(await meta(page, "og:image:width")).toBe("1200");
    expect(await meta(page, "og:image:height")).toBe("630");
    expect(await meta(page, "og:image:alt")).toMatch(/Quantum Broncos/);
    expect(await meta(page, "og:site_name")).toBe("QBronco");
    expect(await meta(page, "og:url")).toBe(`https://qbronco.com${path}`);
    expect(await meta(page, "twitter:card")).toBe("summary_large_image");
    expect(await meta(page, "twitter:image")).toBe("https://qbronco.com/og.jpg");
  }
  const card = await request.get("/og.jpg");
  expect(card.ok()).toBe(true);
  expect(card.headers()["content-type"]).toMatch(/image\/jpeg/);
  expect((await card.body()).length).toBeLessThan(300 * 1024); // WhatsApp's preview limit
});

test("the schedule page lists every meeting as a schema.org Event", async ({ page }) => {
  await page.goto("/schedule");
  const events = (await jsonLd(page)).filter((n) => n["@type"] === "Event");
  expect(events).toHaveLength(25);
  const lab2 = events.find((e) => e.startDate.startsWith("2026-10-28"));
  expect(lab2.name).toBe("QBronco: Lab 2");
  expect(lab2.startDate).toBe("2026-10-28T18:30:00-04:00");
  expect(lab2.endDate).toBe("2026-10-28T20:00:00-04:00");
  expect(lab2.location.name).toMatch(/^Floyd Hall D-212/);
  expect(lab2.location.address.streetAddress).toBe("4601 Campus Drive");
  const afterDst = events.find((e) => e.startDate.startsWith("2026-11-04"));
  expect(afterDst.endDate).toBe("2026-11-04T20:00:00-05:00");
});

test("llms.txt and llms-full.txt give assistants the facts in plain text", async ({ request }) => {
  const short = await request.get("/llms.txt");
  expect(short.ok()).toBe(true);
  const summary = await short.text();
  expect(summary.startsWith("# QBronco (Quantum Broncos)\n")).toBe(true);
  expect(summary).toContain("6:30–8 pm");
  expect(summary).toContain("Floyd Hall room D-212");
  expect(summary).toContain("https://qbronco.com/llms-full.txt");

  const full = await (await request.get("/llms-full.txt")).text();
  for (const date of ["2026-09-16", "2026-10-21", "2027-01-13", "2027-04-28"]) expect(full).toContain(date);
  expect(full).toContain("2026-10-21 (Wed): No meeting (fall break)");
  expect(full).toContain("Mack Usmanova, president");
  expect(full).toContain("Is QBronco the same as the Quantum Broncos? Yes");
});

test("robots.txt welcomes crawlers and points at the sitemap", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/User-agent: \*\s+Allow: \//);
  expect(robots).toContain("Sitemap: https://qbronco.com/sitemap.xml");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  expect(urls).toEqual(["https://qbronco.com/", "https://qbronco.com/schedule", "https://qbronco.com/project"]);
});

test("fonts come from this site, preloaded, with no third-party font request", async ({ page }) => {
  const thirdParty: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://localhost")) thirdParty.push(r.url());
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(thirdParty).toEqual([]);
  const preloads = await page.locator('link[rel="preload"][as="font"]').evaluateAll((els) =>
    els.map((el) => el.getAttribute("href")),
  );
  expect(preloads).toHaveLength(2);
  expect(await page.evaluate(() => document.fonts.check('16px "Patrick Hand"'))).toBe(true);
  expect(await page.evaluate(() => document.fonts.check('700 40px "Caveat Variable"'))).toBe(true);
});

// width and height from a PNG's header
const pngSize = (png: Buffer) => [png.readUInt32BE(16), png.readUInt32BE(20)];

test("every page names its tab icon, a fallback, and the manifest", async ({ page }) => {
  for (const path of ["/", "/schedule", "/project"]) {
    await page.goto(path);
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "/favicon.svg");
    await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute("href", "/favicon-32.png");
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/apple-touch-icon.png");
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/site.webmanifest");
  }
});

test("the SVG favicon is the logo's sphere, in light ink on dark tab bars", async ({ page, request }) => {
  const svg = await request.get("/favicon.svg");
  expect(svg.ok()).toBe(true);
  expect(svg.headers()["content-type"]).toMatch(/image\/svg\+xml/);

  const ink = async (scheme: "light" | "dark") => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/favicon.svg");
    return page.locator("circle.ink").evaluate((c) => getComputedStyle(c).stroke);
  };
  expect(await ink("light")).toBe("rgb(74, 27, 3)"); // the logo's brown
  expect(await ink("dark")).toBe("rgb(246, 231, 200)"); // cream
});

test("favicon.ico is there for anything that asks for it", async ({ request }) => {
  const ico = await request.get("/favicon.ico");
  expect(ico.ok()).toBe(true);
  const body = await ico.body();
  expect([...body.subarray(0, 4)]).toEqual([0, 0, 1, 0]); // icon file signature
  expect(body.readUInt16LE(4)).toBe(3); // 16, 32 and 48 px
});

test("the web app manifest names the club and its home-screen icons", async ({ request }) => {
  const res = await request.get("/site.webmanifest");
  expect(res.ok()).toBe(true);
  expect(res.headers()["content-type"]).toMatch(/application\/manifest\+json/);
  const manifest = await res.json();
  expect(manifest.name).toBe("QBronco (Quantum Broncos)");
  expect(manifest.short_name).toBe("QBronco");
  expect(manifest.start_url).toBe("/");
  expect(manifest.display).toBe("standalone");
  expect(manifest.theme_color).toBe("#fcfbf4");
  expect(manifest.shortcuts.map((s: { url: string }) => s.url)).toEqual(["/schedule", "/project"]);

  const sizes = manifest.icons.map((i: { sizes: string; purpose: string }) => `${i.sizes} ${i.purpose}`);
  expect(sizes).toEqual(["192x192 any", "192x192 maskable", "512x512 any", "512x512 maskable"]);
  for (const icon of manifest.icons) {
    const file = await request.get(icon.src);
    expect(file.ok()).toBe(true);
    expect(file.headers()["content-type"]).toBe(icon.type);
    expect(pngSize(await file.body()).join("x")).toBe(icon.sizes);
  }
});
