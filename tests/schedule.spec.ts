import { expect, test } from "@playwright/test";
import { at } from "./helpers";

test("the schedule lists all 30 wednesdays, crosses off the past and circles the next", async ({ page }) => {
  await at(page, "2026-10-15T12:00:00-04:00", "/schedule");
  await expect(page.locator(".terms .wk")).toHaveCount(30);
  // sept 16, 23, 30, oct 7, oct 14
  await expect(page.locator(".terms .wk.is-over")).toHaveCount(5);
  const next = page.locator(".terms .wk.is-next");
  await expect(next).toHaveCount(1);
  await expect(next).toHaveAttribute("data-week", "2026-10-28");
  await expect(page.locator(".term-label").nth(1)).toContainText("dates can still move");
});

test("no-meeting weeks stay on the list, marked as such", async ({ page }) => {
  await at(page, "2026-10-21T12:00:00-04:00", "/schedule");
  const breakWeek = page.locator('.terms .wk[data-week="2026-10-21"]');
  await expect(breakWeek).toContainText("no meeting (fall break)");
  await expect(breakWeek).toHaveClass(/is-today/);
  await expect(page.locator(".terms .wk-off")).toHaveCount(5);
});

test("checkpoints get a star and a note", async ({ page }) => {
  await page.goto("/schedule");
  await expect(page.locator(".terms .wk-star")).toHaveCount(2);
  await expect(page.locator(".notes")).toContainText("fall demo, dec 9.");
  await expect(page.locator(".notes")).toContainText("final showcase, apr 21.");
});

test("the home page shows the next four wednesdays, skipped weeks included", async ({ page }) => {
  await at(page, "2026-10-15T12:00:00-04:00");
  const shown = page.locator("[data-window] .wk:visible");
  await expect(shown).toHaveCount(4);
  await expect(shown.nth(0)).toHaveAttribute("data-week", "2026-10-21");
  await expect(shown.nth(0)).toContainText("no meeting (fall break)");
  await expect(shown.nth(1)).toHaveClass(/is-next/);
  await expect(shown.nth(3)).toHaveAttribute("data-week", "2026-11-11");
});

test("once the year is over the home page says so instead of an empty list", async ({ page }) => {
  await at(page, "2027-05-01T12:00:00-04:00");
  await expect(page.locator("[data-window] .wk:visible")).toHaveCount(0);
  await expect(page.locator("[data-window] .wk-empty")).toBeVisible();
});

test("the calendar feed has every meeting and nothing else", async ({ request }) => {
  const res = await request.get("/qbronco.ics");
  expect(res.ok()).toBe(true);
  const body = await res.text();

  expect(body.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
  expect(body.endsWith("END:VCALENDAR\r\n")).toBe(true);
  expect(body).not.toMatch(/[^\r]\n/); // CRLF everywhere
  for (const line of body.split("\r\n")) expect(Buffer.byteLength(line)).toBeLessThanOrEqual(75);

  const ics = body.replace(/\r\n /g, ""); // unfold
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(25);
  expect(ics.match(/STATUS:TENTATIVE/g)).toHaveLength(2);
  expect(ics).toContain("UID:2026-10-28@qbronco.com");
  expect(ics).toContain("DTSTART:20261028T223000Z");
  expect(ics).toContain("DTEND:20261029T000000Z"); // 8 pm EDT
  expect(ics).toContain("DTSTART:20261104T233000Z");
  expect(ics).toContain("DTEND:20261105T010000Z"); // 8 pm EST
  expect(ics).toContain("SUMMARY:QBronco: Qubi workshop 1 (proposed)");
  expect(ics).toContain("LOCATION:Floyd Hall D-212\\, 4601 Campus Drive\\, Kalamazoo");
  expect(ics).toContain("LOCATION:Floyd Hall D-202\\, 4601 Campus Drive"); // info night was down the hall
  expect(ics).not.toContain("20261021"); // fall break is not an event
});

test("subscribe links point at the feed", async ({ page }) => {
  await page.goto("/schedule");
  const links = page.locator("#calendar a");
  await expect(links.nth(0)).toHaveAttribute("href", "https://calendar.google.com/calendar/render?cid=webcal://qbronco.com/qbronco.ics");
  await expect(links.nth(1)).toHaveAttribute("href", "webcal://qbronco.com/qbronco.ics");
  await expect(links.nth(2)).toHaveAttribute("href", "/qbronco.ics");
});
