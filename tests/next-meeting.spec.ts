import { expect, test } from "@playwright/test";
import { at } from "./helpers";

// The sticky note on every page answers "when's the next meeting?" for
// whoever is looking, in Kalamazoo time, without anyone editing the site.

test("on a meeting day before 6:30 it says tonight", async ({ page }) => {
  await at(page, "2026-10-07T16:00:00-04:00");
  const note = page.locator("[data-sticky]");
  await expect(note).toHaveAttribute("data-state", "tonight");
  await expect(note).toContainText("tonight!");
  await expect(note).toContainText("lab 1: kickoff");
  await expect(note).toContainText("6:30–8:30 pm");
  await expect(note).toContainText("parkview D-212");
});

test("during the meeting it says happening now", async ({ page }) => {
  await at(page, "2026-10-07T19:00:00-04:00");
  const note = page.locator("[data-sticky]");
  await expect(note).toHaveAttribute("data-state", "now");
  await expect(note).toContainText("happening now");
  await expect(note).toContainText("till 8:30 pm");
});

test("once the meeting ends it moves on to next week", async ({ page }) => {
  await at(page, "2026-10-07T20:31:00-04:00");
  const note = page.locator("[data-sticky]");
  await expect(note).toHaveAttribute("data-state", "next");
  await expect(note).toContainText("study session");
  await expect(note).toContainText("wed oct 14 · 6:30 pm");
});

test("a skipped week is called out so nobody shows up to an empty room", async ({ page }) => {
  await at(page, "2026-10-15T12:00:00-04:00");
  const note = page.locator("[data-sticky]");
  await expect(note).toContainText("lab 2");
  await expect(note).toContainText("wed oct 28");
  await expect(note).toContainText("no meeting oct 21 (fall break)");
});

test("on a no-meeting wednesday it says no meeting today", async ({ page }) => {
  await at(page, "2026-10-21T19:00:00-04:00");
  await expect(page.locator("[data-sticky]")).toContainText("no meeting today (fall break)");
});

test("proposed dates say so", async ({ page }) => {
  await at(page, "2026-11-15T12:00:00-05:00");
  await expect(page.locator("[data-sticky]")).toContainText("Qubi workshop 1 (proposed)");
});

test("over winter break it points at spring kickoff and flags spring as tentative", async ({ page }) => {
  await at(page, "2026-12-20T12:00:00-05:00");
  const note = page.locator("[data-sticky]");
  await expect(note).toContainText("spring kickoff");
  await expect(note).toContainText("wed jan 13");
  await expect(note).toContainText("spring dates can still move");
});

test("after the final showcase it wraps up the year", async ({ page }) => {
  await at(page, "2027-05-01T12:00:00-04:00");
  const note = page.locator("[data-sticky]");
  await expect(note).toHaveAttribute("data-state", "done");
  await expect(note).toContainText("that's a wrap");
});

test.describe("for a visitor in another time zone", () => {
  test.use({ timezoneId: "America/Los_Angeles" });

  test("it still goes by Kalamazoo time", async ({ page }) => {
    // 5 pm in LA is 8 pm in Kalamazoo: mid-meeting
    await at(page, "2026-10-07T17:00:00-07:00");
    await expect(page.locator("[data-sticky]")).toContainText("happening now");
    // 10 pm in LA is already Thursday in Kalamazoo
    await at(page, "2026-10-07T22:00:00-07:00");
    await expect(page.locator("[data-sticky]")).toContainText("wed oct 14");
  });
});

test.describe("without javascript", () => {
  test.use({ javaScriptEnabled: false });

  test("the note still says something true", async ({ page }) => {
    await page.goto("/");
    const note = page.locator("[data-sticky]");
    await expect(note).toContainText("every wednesday");
    await expect(note).toContainText("6:30–8:30 pm");
    await expect(note).toContainText("parkview D-212");
  });
});

test("the note sits on every page and links somewhere useful", async ({ page }) => {
  await at(page, "2026-10-15T12:00:00-04:00", "/project");
  await expect(page.locator("[data-sticky]")).toHaveAttribute("href", "/schedule");
  await at(page, "2026-10-15T12:00:00-04:00", "/schedule");
  await expect(page.locator("[data-sticky]")).toHaveAttribute("href", "#calendar");
});
