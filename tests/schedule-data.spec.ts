import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { MEETING, TERMS, WEEKS, headline } from "../src/data/schedule";

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
  // both proposed Qubi workshops came off the schedule on Nov 22; nothing is proposed now
  expect(WEEKS.filter((w) => w.proposed)).toEqual([]);
  expect(WEEKS.filter((w) => w.about).map((w) => w.date)).toEqual(["2026-12-09", "2027-04-14", "2027-04-21"]);
});

test("no more labs vs meetings: every regular wednesday from oct 28 on is a lab day", () => {
  const regular = WEEKS.filter((w) => w.date >= "2026-10-28" && w.kind === "meeting");
  expect(regular).toHaveLength(16); // 5 in the fall, 11 in the spring
  for (const week of regular) expect(week.title, week.date).toBe("lab day");
  // events and weeks off keep their names
  expect(WEEKS.filter((w) => w.date >= "2026-10-28" && w.kind !== "meeting").map((w) => headline(w))).toEqual([
    "thanksgiving",
    "fall demo + Qubi workshop",
    "finals week",
    "spring kickoff",
    "spring break",
    "final test day",
    "final showcase",
    "finals week",
  ]);
});

test("the only Qubi workshop is dec 9, at 7 after the fall demo, with an rsvp link", () => {
  const qubi = WEEKS.filter((w) => /qubi/i.test(headline(w)));
  expect(qubi.map((w) => w.date)).toEqual(["2026-12-09"]);
  expect(qubi[0].title).toBe("fall demo");
  expect(qubi[0].also).toEqual({ title: "Qubi workshop", at: "7 pm", rsvp: "https://experiencewmu.wmich.edu/event/12996082" });
});

test("qbronco.com/workshop is a short link to the workshop rsvp", () => {
  // a Vercel redirect, so it only exists once deployed; check it points where the schedule does
  const { redirects } = JSON.parse(readFileSync("vercel.json", "utf8"));
  const rsvp = WEEKS.find((w) => w.also?.title === "Qubi workshop")!.also!.rsvp;
  expect(redirects).toContainEqual({ source: "/workshop", destination: rsvp, permanent: false });
});

test("meetings run 6:30 to 8 pm Kalamazoo time on both sides of daylight saving", () => {
  const start = (date: string) => new Date(WEEKS.find((w) => w.date === date)!.start).toISOString();
  expect(start("2026-10-28")).toBe("2026-10-28T22:30:00.000Z"); // EDT
  expect(start("2026-11-04")).toBe("2026-11-04T23:30:00.000Z"); // EST from Nov 1
  expect(start("2027-03-03")).toBe("2027-03-03T23:30:00.000Z"); // still EST
  expect(start("2027-03-17")).toBe("2027-03-17T22:30:00.000Z"); // EDT from Mar 14
  for (const week of WEEKS) expect(week.end - week.start).toBe(90 * 60 * 1000);
  expect(MEETING.room).toBe("D-212");
  expect(MEETING.building).toBe("floyd hall");
});
