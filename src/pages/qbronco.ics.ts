import type { APIRoute } from "astro";
import { MEETING, TZ, UPDATED, WEEKS, kalamazooTime } from "../data/schedule";

// The calendar feed. People subscribe to /qbronco.ics (webcal:// or Google's
// "add by URL") and their calendar re-reads it on its own, so when a date in
// src/data/schedule.ts moves, subscribers see it move. Weeks with no meeting
// are left out. Times are written in UTC so no VTIMEZONE block is needed.

const utc = (ms: number) =>
  new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// RFC 5545 text escaping
const text = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

// RFC 5545: lines over 75 octets continue on the next line after one space
const utf8 = new TextEncoder();
function fold(line: string): string {
  const out: string[] = [];
  let chunk = "";
  let size = 0;
  for (const ch of line) {
    const n = utf8.encode(ch).length;
    if (size + n > (out.length ? 74 : 75)) {
      out.push(chunk);
      chunk = "";
      size = 0;
    }
    chunk += ch;
    size += n;
  }
  out.push(chunk);
  return out.join("\r\n ");
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL("https://qbronco.com")).origin;
  const host = new URL(origin).host;
  const stamp = utc(kalamazooTime(UPDATED, [12, 0]));
  const hours = `Wednesdays ${MEETING.time.replace("–", "-").toUpperCase()}`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//QBronco//Meetings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:QBronco",
    `X-WR-CALDESC:${text(`WMU's quantum computing club. ${hours}, room ${MEETING.room} on Parkview campus.`)}`,
    `X-WR-TIMEZONE:${TZ}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
  ];

  for (const week of WEEKS) {
    if (week.kind === "off") continue;
    const notes = [
      week.about && cap(week.about),
      week.proposed && "Proposed date, it can still move.",
      !week.proposed && week.tentative && "Spring dates can still move.",
      "No experience needed, just show up.",
      `${origin}/schedule`,
    ].filter(Boolean);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${week.date}@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utc(week.start)}`,
      `DTEND:${utc(week.end)}`,
      `SUMMARY:${text(`QBronco: ${cap(week.title)}${week.proposed ? " (proposed)" : ""}`)}`,
      `LOCATION:${text(`Room ${week.room ?? MEETING.room}, Parkview Campus, Western Michigan University, Kalamazoo, MI`)}`,
      `DESCRIPTION:${text(notes.join("\n"))}`,
      `URL:${origin}/schedule`,
      `STATUS:${week.proposed ? "TENTATIVE" : "CONFIRMED"}`,
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: { "Content-Type": "text/calendar; charset=utf-8" },
  });
};
