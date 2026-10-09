# QBronco website

The site for QBronco (the Quantum Broncos), WMU's quantum computing club: https://qbronco.com. It's a static Astro site styled as one sheet of ruled notebook paper, hosted on Vercel. [README.md](README.md) has the full tour: pages, file layout, design rules and tests.

## Task guides

Read the guide before starting one of these tasks:

| Task | Read |
| :-- | :-- |
| **Adding, changing or removing an officer** | [docs/adding-an-officer.md](docs/adding-an-officer.md) (also the `add-officer` skill) |
| Changing meeting dates, the room or the time | README.md, "Meeting dates" |
| Adding photos to the reel | README.md, "Officers, photos and links" |
| Changing the link-preview card, icons or README picture | README.md, "Images made by scripts" |

When a new kind of task comes up more than once, write a guide in `docs/`, then link it from this table and from `docs/README.md`.

## Commands

```sh
npm run dev            # localhost:4321
npm test               # builds, serves on :4322, runs Playwright at desktop + Pixel 7 sizes
npm run officer-photo -- <photo> <first-last> [--crop left,top,size]
npm run officers-screenshot   # the officers section, desktop + phone, in one image
npm run compare -- <path> [<css selector> | "@heading"]   # before (main) vs after, desktop + phone
npm run og             # public/og.jpg
npm run icons          # favicons + manifest icons
npm run screenshots    # docs/screenshots/home.webp
```

## Ground rules

- **Content lives in `src/data/`.**
  - `schedule.ts` holds the dates, room and time.
  - `people.ts` holds the club links, officers and photo reel.
  - Pages, the calendar feed, JSON-LD and `llms.txt` all read from these files. Don't hard-code a date, name or room into a page.
- **Everything sits on the ruled lines.** Every vertical measure in `src/styles/global.css` is a multiple of `--rule-gap` (28px, or 26px on phones). `tests/layout.spec.ts` checks this.
- **Pencil voice on the page, proper case for machines.**
  - Page copy is lowercase ("floyd hall D-212").
  - The calendar feed, JSON-LD and `llms.txt` use proper case, via the helpers in `schedule.ts`.
- **Generated images come from scripts, never hand edits.** That covers `og.jpg`, the icons, the README picture and officer headshots.
  - `og.jpg`'s URL carries a content fingerprint (`src/data/card.ts`), so a new card needs no other change.
- **Run `npm test` before committing.** Tests that depend on the date freeze the browser clock with `page.clock`.
- **Keep `@playwright/test` pinned at 1.56.1.** It matches the Chromium preinstalled in Claude Code cloud sessions (`/opt/pw-browsers`); don't run `playwright install` there.

## Tests: update them with the code

Every pull request runs `npm test` in GitHub Actions (`.github/workflows/test.yml`). A red run means the PR isn't ready to merge. The tests check real content (dates, names, counts, the email), so a change to that content breaks them on purpose. That's how they catch mistakes, and it's also how they go stale if nobody updates them.

- **Before changing code, find the tests that cover it** using the table below, or grep `tests/` for the text, selector or value you're changing.
- **Update those tests in the same commit** when the behaviour or content changes on purpose. Never leave a test describing what the site used to do.
- **A new feature gets a new test** in the spec that matches it.
- **Never delete, skip or loosen a test just to get CI green.** If a test is wrong, fix what it checks and say why in the commit.
- **Run `npm test` before pushing**, and don't call a PR ready until CI is green on its latest commit.

| If you change... | Check these specs |
| :-- | :-- |
| `src/data/schedule.ts` (dates, titles, room, time, terms) | `schedule-data.spec.ts` (counts: 14 fall weeks, 16 spring, 25 meetings), `schedule.spec.ts` (30 Wednesdays, coming-up list, `.ics`), `next-meeting.spec.ts` (specific dates and titles), `discovery.spec.ts` (Event JSON-LD, llms dates), `layout.spec.ts` |
| `OFFICERS` in `src/data/people.ts` | `people.spec.ts`; it keeps its own list in order (see `docs/adding-an-officer.md`) |
| `CLUB` (links, email, sign-up) or `FIRST_MEETING` | `contact.spec.ts`, `discovery.spec.ts` (profiles, `sameAs`, llms) |
| `REEL` or the subteam photos | `people.spec.ts` |
| `src/layouts/Notebook.astro` (tabs, sticky note script, footer) | `next-meeting.spec.ts`, `layout.spec.ts`, `contact.spec.ts` |
| `src/layouts/Base.astro` (titles, meta, JSON-LD, icons) | `discovery.spec.ts` |
| `src/data/llms.ts` | `discovery.spec.ts`, `contact.spec.ts` |
| `src/styles/global.css` | `layout.spec.ts` (everything on the ruled lines, no sideways scroll), the phone sticky-note test in `next-meeting.spec.ts`, `people.spec.ts` (name lines) |
| `public/og.jpg`, icons, manifest | `discovery.spec.ts` |

## Show visible changes

For any change people will see on the site, show the user before/after screenshots in the chat before committing, even when nobody asks.

1. Run `npm run compare -- <path> <part>` for each changed spot. It builds `origin/main` and your working copy, and screenshots that part at desktop and phone widths.
2. Read the image yourself first, and fix anything that looks off.
3. Send it to the user (`SendUserFile` where it's available).

