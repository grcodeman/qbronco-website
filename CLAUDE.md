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
