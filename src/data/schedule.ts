// The whole year, one row per Wednesday. Source: the qBronco Project Plan,
// updated Oct 7, 2026.
//
// Every date on the site reads from this file: the sticky note, the
// schedule page, the "coming up" list on the home page, and the calendar
// feed at /qbronco.ics. Change a row here and all of them follow.

export const TZ = "America/Detroit";
export const UPDATED = "2026-10-07";

// the standing meeting. every row below happens here unless it says otherwise.
export const MEETING = {
  start: [18, 30] as const,
  end: [20, 30] as const,
  time: "6:30–8:30 pm",
  from: "6:30 pm",
  until: "8:30 pm",
  room: "D-212",
  campus: "parkview",
  map: "https://www.google.com/maps/search/?api=1&query=Western+Michigan+University+Parkview+Campus",
};

export type Kind = "lab" | "study" | "event" | "off";

export interface Week {
  date: string; // YYYY-MM-DD, local Kalamazoo date (always a Wednesday)
  title: string; // written the way it appears on the page
  kind: Kind; // "off" = no meeting that week; the title says why
  proposed?: boolean; // the date isn't locked in yet
  about?: string; // a checkpoint: gets a red star and a footnote
  room?: string; // only when it isn't the usual room
}

export interface Term {
  id: string;
  label: string;
  note?: string;
  tentative?: boolean;
  weeks: Week[];
}

export const TERMS: Term[] = [
  {
    id: "fall-2026",
    label: "fall '26",
    weeks: [
      { date: "2026-09-16", title: "info night", kind: "event", room: "D-202" },
      { date: "2026-09-23", title: "study session", kind: "study" },
      { date: "2026-09-30", title: "Qiskit day", kind: "event" },
      { date: "2026-10-07", title: "lab 1: kickoff", kind: "lab" },
      { date: "2026-10-14", title: "study session", kind: "study" },
      { date: "2026-10-21", title: "fall break", kind: "off" },
      { date: "2026-10-28", title: "lab 2", kind: "lab" },
      { date: "2026-11-04", title: "study session", kind: "study" },
      { date: "2026-11-11", title: "lab 3", kind: "lab" },
      { date: "2026-11-18", title: "Qubi workshop 1", kind: "event", proposed: true },
      { date: "2026-11-25", title: "thanksgiving", kind: "off" },
      { date: "2026-12-02", title: "lab 4", kind: "lab" },
      {
        date: "2026-12-09",
        title: "fall demo",
        kind: "event",
        about:
          "a circuit goes through our compiler, runs on the python version of our machine and matches Qiskit. we run the same instructions by hand on the Qubis.",
      },
      { date: "2026-12-16", title: "finals week", kind: "off" },
    ],
  },
  {
    id: "spring-2027",
    label: "spring '27",
    note: "dates can still move",
    tentative: true,
    weeks: [
      { date: "2027-01-13", title: "spring kickoff", kind: "event" },
      { date: "2027-01-20", title: "lab 5", kind: "lab" },
      { date: "2027-01-27", title: "study session", kind: "study" },
      { date: "2027-02-03", title: "lab 6", kind: "lab" },
      { date: "2027-02-10", title: "Qubi workshop 2", kind: "event", proposed: true },
      { date: "2027-02-17", title: "lab 7", kind: "lab" },
      { date: "2027-02-24", title: "study session", kind: "study" },
      { date: "2027-03-03", title: "lab 8", kind: "lab" },
      { date: "2027-03-10", title: "spring break", kind: "off" },
      { date: "2027-03-17", title: "study session", kind: "study" },
      { date: "2027-03-24", title: "lab 9", kind: "lab" },
      { date: "2027-03-31", title: "study session", kind: "study" },
      { date: "2027-04-07", title: "lab 10", kind: "lab" },
      { date: "2027-04-14", title: "final test day", kind: "event" },
      {
        date: "2027-04-21",
        title: "final showcase",
        kind: "event",
        about: "every target we finished, the test results, and the paper.",
      },
      { date: "2027-04-28", title: "finals week", kind: "off" },
    ],
  },
];

// ---------- derived ----------

export interface Dated extends Week {
  term: string;
  tentative: boolean;
  start: number; // epoch ms
  end: number; // epoch ms
  label: string; // "oct 14"
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "june", "july", "aug", "sept", "oct", "nov", "dec"];

/** "2026-10-14" -> "oct 14" */
export function shortDate(date: string): string {
  const [, m, d] = date.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

/** minutes the zone is ahead of UTC at a given instant (Detroit: -240 or -300) */
function zoneOffset(at: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - at) / 60000);
}

/** wall-clock time in Kalamazoo -> epoch ms. meetings are evenings, so the
 *  2am daylight-saving gap never comes into it. */
export function kalamazooTime(date: string, [h, min]: readonly [number, number]): number {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, min);
  return guess - zoneOffset(guess, TZ) * 60000;
}

export const WEEKS: Dated[] = TERMS.flatMap((term) =>
  term.weeks.map((week) => ({
    ...week,
    term: term.id,
    tentative: !!term.tentative,
    start: kalamazooTime(week.date, MEETING.start),
    end: kalamazooTime(week.date, MEETING.end),
    label: shortDate(week.date),
  })),
);

/** today's date in Kalamazoo, as YYYY-MM-DD */
export function kalamazooDate(at: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/** a meeting is over once it ends; a no-meeting week is over once its day has passed */
export function isOver(week: Dated, now: number): boolean {
  return week.kind === "off" ? week.date < kalamazooDate(now) : week.end <= now;
}
