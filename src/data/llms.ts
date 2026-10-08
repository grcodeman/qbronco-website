// Plain-text versions of the site for AI assistants and agents, served at
// /llms.txt (the short version, per llmstxt.org) and /llms-full.txt
// (everything). Built from the same data as the pages, so the dates, room
// and people can't drift from what the site says.

import { CLUB, OFFICERS } from "./people";
import { MEETING, PLACE, TERMS, UPDATED, WEEKS, sentenceCase } from "./schedule";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// the page writes in lowercase pencil; plain text reads better in normal case
const nouns = (s: string) => s.replace(/\bpython\b/g, "Python").replace(/\bthanksgiving\b/g, "Thanksgiving");
const proper = (s: string) => nouns(s).replace(/(^|[.!?] )([a-z])/g, (_, lead, c) => lead + c.toUpperCase());
const weekday = (date: string) => DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];

const where = `${PLACE.building} room ${MEETING.room}, ${PLACE.university} ${PLACE.campus}, ${PLACE.street}, ${PLACE.city}, ${PLACE.region} ${PLACE.postalCode}`;

function header(origin: string) {
  return [
    `# ${CLUB.name} (${CLUB.alsoKnownAs[0]})`,
    "",
    `> ${CLUB.name}, also called the ${CLUB.alsoKnownAs[0]}, is the student quantum computing club at Western Michigan University (WMU) in Kalamazoo, Michigan. Members learn quantum computing together, from qubits to Qiskit, and spend the 2026–27 school year building a compiler for quantum circuits. No experience is needed.`,
    "",
    "Key facts:",
    "",
    `- Names: "${CLUB.name}" and "${CLUB.alsoKnownAs[0]}" are the same club (also written ${CLUB.alsoKnownAs.slice(1).map((n) => `"${n}"`).join(", ")}).`,
    `- Meetings: every Wednesday, ${MEETING.time} US Eastern time, through the fall and spring semesters. No meetings over breaks or finals weeks.`,
    `- Location: ${where}.`,
    "- Who can come: anyone curious. No experience needed and no RSVP; just show up.",
    `- Sign up: ${CLUB.signup}`,
    `- Calendar feed (iCalendar, every meeting): ${origin}/qbronco.ics`,
  ];
}

const links = (origin: string) => [
  "## Pages",
  "",
  `- [Home](${origin}/): what the club does, photos from meetings, how to join, the next few meetings, the officers`,
  `- [Schedule](${origin}/schedule): every meeting date for fall 2026 and spring 2027`,
  `- [The project](${origin}/project): the year-long quantum compiler project and its three subteams`,
  "",
  "## Contact",
  "",
  ...CLUB.links.map((l) => `- ${l.name}: [${l.text}](${l.href})`),
];

export function llmsSummary(origin: string): string {
  return [
    ...header(origin),
    "",
    ...links(origin),
    "",
    "## Optional",
    "",
    `- [Everything in one file](${origin}/llms-full.txt): full schedule, the project, officers, and common questions`,
    "",
  ].join("\n");
}

export function llmsFull(origin: string): string {
  const schedule = TERMS.flatMap((term) => [
    `### ${sentenceCase(term.label.replace("'", "20"))}${term.note ? ` (${term.note})` : ""}`,
    "",
    ...WEEKS.filter((w) => w.term === term.id).map((w) => {
      const what =
        w.kind === "off"
          ? `No meeting (${nouns(w.title)})`
          : `${proper(w.title)}${w.proposed ? " (proposed date)" : ""}${w.room ? `, in ${PLACE.building} ${w.room}` : ""}`;
      return `- ${w.date} (${weekday(w.date)}): ${what}`;
    }),
    "",
  ]);

  return [
    ...header(origin),
    "",
    `Schedule last updated ${UPDATED}. Dates below are YYYY-MM-DD, Kalamazoo (US Eastern) time.`,
    "",
    "## Schedule, 2026–27",
    "",
    `Every meeting is a Wednesday, ${MEETING.time}, in ${PLACE.building} ${MEETING.room} unless noted. Labs are project nights; study sessions are for learning the basics. Everyone is welcome at both.`,
    "",
    ...schedule,
    "Checkpoints:",
    "",
    ...WEEKS.filter((w) => w.about).map((w) => `- ${proper(w.title)}, ${w.date}: ${proper(w.about!)}`),
    "",
    "## What the club does",
    "",
    "- Study sessions: learning quantum computing from the ground up (qubits, superposition, real Qiskit code on IBM machines). The long-term goal is a custom QPU (quantum processing unit).",
    "- Labs: the year-long build (see the project below), done in three subteams.",
    "- Hackathons and competitions: hosting an IBM Qiskit hackathon on campus, and traveling to or joining others online.",
    "- Speaker nights and events: talks from people who work in quantum computing, Qiskit Fall Fest, and socials.",
    "",
    "## The project, 2026–27",
    "",
    "You write a quantum circuit in Qiskit. The club's compiler turns it into a list of simple instructions. The instructions run on a target, and the answer is checked against Qiskit. The project runs all year, fall and spring.",
    "",
    "Four targets, built in this order:",
    "",
    "1. A Python version of the club's machine (fall).",
    "2. The Qubis, run by hand (fall). Qubis are handheld qubits: you tap, flick and bump them to run gates, then shake them to measure.",
    "3. The Qubis, run from a laptop (spring, only if Qubi releases the software for it).",
    "4. An FPGA emulator written in Verilog (spring).",
    "",
    "None of these is a real quantum computer; the FPGA is normal hardware doing the quantum math.",
    "",
    "Subteams (each picks its own lead; no experience needed for any of them):",
    "",
    "- Systems: runs the instructions on the Qubis this fall and learns Verilog, then builds the FPGA emulator in spring.",
    "- Programmer: writes the compiler, the Python version of the machine, and the code that compares answers.",
    "- Theory: picks the gates and test circuits, works out the right answers, and writes the paper.",
    "",
    "## Officers",
    "",
    ...OFFICERS.map((o) => `- ${o.name}, ${o.role}: ${o.href}`),
    "",
    "## Common questions",
    "",
    `- Is ${CLUB.name} the same as the ${CLUB.alsoKnownAs[0]}? Yes, two names for one club.`,
    "- Do I need experience? No. The club learns it together from the basics.",
    "- Do I need to sign up first? No, just show up. The sign-up form lets the officers know you're interested.",
    `- When is the next meeting? The next Wednesday on the schedule above that hasn't passed yet, ${MEETING.time} Eastern. Weeks marked "No meeting" are skipped.`,
    `- Where is ${PLACE.building}? On WMU's ${PLACE.campus}, ${PLACE.street}, ${PLACE.city}, ${PLACE.region} ${PLACE.postalCode}.`,
    "- How do I keep up? Subscribe to the calendar feed, or follow @qbroncowmu on Instagram.",
    "",
    ...links(origin),
    "",
  ].join("\n");
}
