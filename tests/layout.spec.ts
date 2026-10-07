import { expect, test } from "@playwright/test";
import { at, offRule } from "./helpers";

const PAGES = [
  { path: "/", tab: "QBronco" },
  { path: "/schedule", tab: "schedule" },
  { path: "/project", tab: "the project" },
  { path: "/no-such-page", tab: null },
];

for (const { path, tab } of PAGES) {
  test.describe(path, () => {
    test("loads without errors and never scrolls sideways", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(m.text()));
      await at(page, "2026-10-15T12:00:00-04:00", path);
      await page.evaluate(() => document.fonts.ready);
      expect(errors).toEqual([]);
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
    });

    // the golden rule of global.css: every line of writing lands on a rule
    for (const iso of ["2026-10-07T19:00:00-04:00", "2026-11-15T12:00:00-05:00"]) {
      test(`writing sits on the ruled lines (${iso.slice(0, 10)})`, async ({ page }) => {
        await at(page, iso, path);
        await page.evaluate(() => document.fonts.ready);
        expect(await offRule(page)).toEqual([]);
      });
    }

    test("the divider tab for this page is pulled forward", async ({ page }) => {
      await page.goto(path);
      const current = page.locator('.tabs a[aria-current="page"]');
      if (tab) await expect(current).toHaveText(tab);
      else await expect(current).toHaveCount(0);
    });
  });
}

test("the tabs move between pages", async ({ page }) => {
  await page.goto("/");
  await page.locator(".tabs").getByText("schedule").click();
  await expect(page).toHaveURL(/\/schedule\/?$/);
  await page.locator(".tabs").getByText("the project").click();
  await expect(page).toHaveURL(/\/project\/?$/);
  await page.locator(".tabs").getByText("QBronco").click();
  await expect(page).toHaveURL(/\/$/);
});

test("/calendar lands on the schedule", async ({ page }) => {
  await page.goto("/calendar");
  await expect(page).toHaveURL(/\/schedule\/?$/);
});

test("keyboard focus is visible", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).toBe("dashed");
});
