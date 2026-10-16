// Plain-text versions of the site for AI assistants and agents, served at
// /llms.txt (the short version, per llmstxt.org) and /llms-full.txt
// (everything). Built from the same data as the pages, so the dates, room
// and people can't drift from what the site says.

import { CLUB, FIRST_MEETING, OFFICERS } from "./people";
import { MEETING, PLACE, TERMS, UPDATED, WEEKS, properCase, properNouns, sentenceCase } from "./schedule";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const weekday = (date: string) => DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];

const where = `${PLACE.building} room ${MEETING.room}, ${PLACE.university} ${PLACE.campus}, ${PLACE.street}, ${PLACE.city}, ${PLACE.region} ${PLACE.postalCode}`;

function header(origin: string) {
  return [
    `# ${CLUB.name} (${CLUB.alsoKnownAs[0]})`,
    "",
    `> ${CLUB.name}, also called the ${CLUB.alsoKnownAs[0]}, is the student quantum computing club at Western Michigan University (WMU) in Kalamazoo, Michigan. Members learn quantum computing together, from qubits to Qiskit, and spend the 2026–27 school year building their own 3-qubit processor with its own instruction set, written in Verilog and run on an FPGA. No experience is needed.`,
    "",
    "Key facts:",
    "",
    `- Names: "${CLUB.name}" and "${CLUB.alsoKnownAs[0]}" are the same club (also written ${CLUB.alsoKnownAs.slice(1).map((n) => `"${n}"`).join(", ")}).`,
    `- Meetings: every Wednesday, ${MEETING.time} US Eastern time, through the fall and spring semesters. No meetings over breaks or finals weeks.`,
    `- Location: ${where}.`,
    "- Who can come: anyone curious. No experience needed and no RSVP; just show up.",
    `- Sign up: ${CLUB.signup}`,
    `- Contact: email ${CLUB.email.name} (${CLUB.email.role}) at ${CLUB.email.address}. Companies, researchers and faculty who want to give a talk or help with events use the same address.`,
    `- First meeting: bring ${FIRST_MEETING.bring}. Joining partway through the semester is fine; new members join a team and get material to catch up.`,
    `- Calendar feed (iCalendar, every meeting): ${origin}/qbronco.ics`,
  ];
}

const links = (origin: string) => [
  "## Pages",
  "",
  `- [Home](${origin}/): what the club does, photos from meetings, how to join, the next few meetings, how companies and faculty can work with the club, the officers`,
  `- [Schedule](${origin}/schedule): every meeting date for fall 2026 and spring 2027`,
  `- [The project](${origin}/project): the year-long project, a 3-qubit processor with its own instruction set, and its three teams`,
  "",
  "## Contact",
  "",
  `- [Email: ${CLUB.email.address}](mailto:${CLUB.email.address}): ${CLUB.email.name}, ${CLUB.email.role}`,
  ...CLUB.links.map((l) => `- [${l.name}: ${l.text}](${l.href})`),
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
          ? `No meeting (${properNouns(w.title)})`
          : `${properCase(w.title)}${w.proposed ? " (proposed date)" : ""}${w.room ? `, in ${PLACE.building} ${w.room}` : ""}`;
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
    `Every meeting is a Wednesday, ${MEETING.time}, in ${PLACE.building} ${MEETING.room} unless noted. Every meeting has the same format: five minutes of what's new, then teams sit together and build, and anyone new or without a team pairs with someone for the night. Labs are regular meetings with a deliverable due.`,
    "",
    ...schedule,
    "Checkpoints:",
    "",
    ...WEEKS.filter((w) => w.about).map((w) => `- ${properCase(w.title)}, ${w.date}: ${properCase(w.about!)}`),
    "",
    "## What the club does",
    "",
    "- Wednesday meetings: five minutes of what's new, then teams sit together and build. If a team needs a concept, someone teaches it at the whiteboard for ten minutes. In the last five minutes each team writes on the board what got done and what's next. Nobody presents and there is no homework. Members learn everything from the ground up, and the fall study slide decks are a self-serve library on the club's GitHub.",
    "- This year's build: the club's own 3-qubit processor (see the project below), done in three teams.",
    "- Hackathons and competitions: members go to regional quantum events and join online ones. Hosting one of the club's own is a someday goal, not on the calendar.",
    "- Speaker nights and events: talks from people who work in quantum computing, plus socials.",
    "",
    "## Working with the club",
    "",
    `Companies, researchers and WMU faculty can work with the club by giving a talk at a speaker night or proposing something else. Email ${CLUB.email.name}, the club's ${CLUB.email.role}, at ${CLUB.email.address}. The club is a WMU student organization advised by ${OFFICERS.find((o) => o.role === "faculty advisor")!.name} (Electrical and Computer Engineering).`,
    "",
    "## The project, 2026–27",
    "",
    "The club is building a 3-qubit processor with its own 16-bit instruction set, written in Verilog, run on an FPGA (a Digilent Nexys A7) and checked against Qiskit. The design is modeled on eQASM, a published quantum instruction set from TU Delft, the way a CPU class models its chip on MIPS. The project runs all year, fall and spring.",
    "",
    "Four programs run on it: a Bell state, quantum teleportation, a quantum Fourier transform, and Grover's search over 8 items. A Python model of the processor defines what the hardware is supposed to do, and Qiskit is the answer key. For Grover's search, random guessing finds the item 12.5% of the time; the processor finds it with probability 121/128, about 94.5%.",
    "",
    "One target, in three forms:",
    "",
    "1. A Python model of the processor (fall).",
    "2. The Verilog design, running in simulation (fall into spring).",
    "3. The design on the FPGA board (spring).",
    "",
    "None of these is a real quantum computer; the FPGA is normal hardware doing the quantum math.",
    "",
    "The Qubis (handheld model qubits you tap, bump and shake) are a teaching toy, not part of the build. They come out at some meetings, at recruiting events and at the proposed Qubi workshops.",
    "",
    "Teams (each picks its own lead; no experience needed for any of them; members can join partway through the year and get caught up):",
    "",
    "- Systems: builds the processor in Verilog, then puts it on the Nexys A7 board.",
    "- Programming: writes the compiler that turns a Qiskit circuit into the processor's instructions, the Python model of the processor that defines what the hardware is supposed to do, and the checker that compares results against Qiskit.",
    "- Theory: picks the gate set and the four programs, works out the expected answers on paper, and writes the paper.",
    "",
    `Code and the fall slide decks: ${CLUB.links.find((l) => l.name === "GitHub")!.href}`,
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
    `- What should I bring to my first meeting? ${FIRST_MEETING.bring.charAt(0).toUpperCase() + FIRST_MEETING.bring.slice(1)}.`,
    "- Can I join partway through the semester? Yes. Join a team and the club will give you the material to get caught up.",
    `- How do I contact the club? Email ${CLUB.email.name} (${CLUB.email.role}) at ${CLUB.email.address}, or message @qbroncowmu on Instagram.`,
    `- How can a company or professor get involved? Give a talk at a speaker night, or suggest something else. Email ${CLUB.email.address}.`,
    `- When is the next meeting? The next Wednesday on the schedule above that hasn't passed yet, ${MEETING.time} Eastern. Weeks marked "No meeting" are skipped.`,
    `- Where is ${PLACE.building}? On WMU's ${PLACE.campus}, ${PLACE.street}, ${PLACE.city}, ${PLACE.region} ${PLACE.postalCode}.`,
    "- How do I keep up? Subscribe to the calendar feed, or follow @qbroncowmu on Instagram.",
    "",
    ...links(origin),
    "",
  ].join("\n");
}
