import { expect, test } from "@playwright/test";

const OFFICERS = [
  ["Dr. Sawalha", "faculty advisor", "https://wmich.edu/electrical-computer/directory/sawalha", "sawalha"],
  ["Mack Usmanova", "president", "https://www.linkedin.com/in/mukaddass/", "mack-usmanova"],
  ["Cody Thornell", "vice president", "https://www.linkedin.com/in/codythornell/", "cody-thornell"],
  ["Jordan Johnson", "events officer", "https://www.linkedin.com/in/jordan-sjohnson/", "jordan-johnson"],
  ["Hana Tourner", "marketing officer", "https://www.linkedin.com/in/hanatourner/", "hana-tourner"],
  ["Lola MacAlpine", "tech officer", "https://www.linkedin.com/in/lola-macalpine-251632366/", "lola-macalpine"],
];

test("all six officers, each with a role, a profile link and a circular photo", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator(".officer");
  await expect(cards).toHaveCount(OFFICERS.length);

  for (const [i, [name, role, href, photo]] of OFFICERS.entries()) {
    const card = cards.nth(i);
    await expect(card.locator(".officer-name")).toHaveText(name);
    await expect(card.locator(".officer-role")).toHaveText(role);

    const link = card.locator("a");
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", /noopener/);

    const img = card.locator("img");
    await expect(img).toHaveAttribute("src", `/officers/${photo}.webp`);
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(0);
    expect(await img.evaluate((el) => getComputedStyle(el).borderRadius)).toBe("50%");
  }
});

test("each name line fits on one rule", async ({ page }) => {
  await page.goto("/");
  for (const el of await page.locator(".officer-name, .officer-role").all()) {
    const { height, lineHeight } = await el.evaluate((n) => ({
      height: n.getBoundingClientRect().height,
      lineHeight: parseFloat(getComputedStyle(n).lineHeight),
    }));
    expect(height).toBeLessThanOrEqual(lineHeight + 0.5);
  }
});

test("the photo reel scrolls inside the page, not the page itself", async ({ page }) => {
  await page.goto("/");
  const reel = page.locator("[data-reel]");
  const photos = reel.locator("img");
  await expect(photos).toHaveCount(4);
  for (const img of await photos.all()) {
    expect((await img.getAttribute("alt"))!.length).toBeGreaterThan(20);
  }
  await expect(reel.locator(".polaroid-caption").first()).toHaveText("info night, sept 16");
  const { scrollWidth, clientWidth } = await reel.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }));
  expect(scrollWidth).toBeGreaterThan(clientWidth);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );
});

test("pencil arrows page through the reel with a mouse; touch screens just swipe", async ({ page }, info) => {
  await page.goto("/");
  const nav = page.locator('[data-reel-nav="reel"]');
  if (info.project.name === "mobile") {
    await expect(nav).toBeHidden();
    return;
  }
  const back = nav.locator('[data-dir="-1"]');
  const more = nav.locator('[data-dir="1"]');
  await expect(back).toBeDisabled();
  await more.click();
  await expect.poll(() => page.locator("[data-reel]").evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
  await expect(back).toBeEnabled();
});
