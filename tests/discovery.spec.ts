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
    expect(await meta(page, "og:site_name")).toBe("QBronco (Quantum Broncos)");
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
