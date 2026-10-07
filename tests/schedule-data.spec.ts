import { expect, test } from "@playwright/test";
import { MEETING, TERMS, WEEKS } from "../src/data/schedule";

// plain data checks, no browser needed: run them once
test.beforeEach(({}, info) => {
  test.skip(info.project.name !== "desktop", "data checks run once");
});

test("every row is a Wednesday, in order, with no repeats", () => {
  const dates = WEEKS.map((w) => w.date);
  expect(new Set(dates).size).toBe(dates.length);
  expect([...dates].sort()).toEqual(dates);
  for (const date of dates) {
    expect(new Date(`${date}T12:00:00Z`).getUTCDay(), date).toBe(3);
  }
});

test("matches the project plan: 14 fall weeks, 16 spring weeks, 25 meetings", () => {
  expect(TERMS.map((t) => t.weeks.length)).toEqual([14, 16]);
  expect(WEEKS.filter((w) => w.kind !== "off")).toHaveLength(25);
  expect(WEEKS.filter((w) => w.proposed).map((w) => w.title)).toEqual(["Qubi workshop 1", "Qubi workshop 2"]);
  expect(WEEKS.filter((w) => w.about).map((w) => w.date)).toEqual(["2026-12-09", "2027-04-21"]);
});

test("meetings run 6:30 to 8:30 pm Kalamazoo time on both sides of daylight saving", () => {
  const start = (date: string) => new Date(WEEKS.find((w) => w.date === date)!.start).toISOString();
  expect(start("2026-10-28")).toBe("2026-10-28T22:30:00.000Z"); // EDT
  expect(start("2026-11-04")).toBe("2026-11-04T23:30:00.000Z"); // EST from Nov 1
  expect(start("2027-03-03")).toBe("2027-03-03T23:30:00.000Z"); // still EST
  expect(start("2027-03-17")).toBe("2027-03-17T22:30:00.000Z"); // EDT from Mar 14
  for (const week of WEEKS) expect(week.end - week.start).toBe(2 * 60 * 60 * 1000);
  expect(MEETING.room).toBe("D-212");
});
