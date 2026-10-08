---
name: add-officer
description: Add a new officer to the QBronco website, or change or remove one (name, role, profile link, headshot). Use when asked to add an officer, update someone's role, link or photo, or take someone off the "who's running this" list on the home page.
---

# Add, change or remove an officer

The steps live in one place, `docs/adding-an-officer.md`. Read it and follow it from start to finish. These notes cover doing it as Claude.

1. **Collect the four things** the guide asks for: name, role, profile link and headshot. Ask only for what's missing, and don't add an officer without a photo.
   - Write the role in lowercase, the way the page does ("tech officer").
   - A photo attached in chat is saved to disk; its path is in the message. Pass that path to the script.
2. **Crop the headshot** with `npm run officer-photo -- <photo> <slug>`.
   1. Read the preview image the script prints.
   2. Re-run with `--crop left,top,size` until the head size, eye line and centering match the others.
   3. Give the user the final preview.
3. **Edit both lists:** `OFFICERS` in `src/data/people.ts` and `OFFICERS` in `tests/people.spec.ts`.
4. **Run `npm test`.**
5. **Show the result.** Screenshot the officers section at desktop and phone widths and send it to the user before committing.
6. **Commit** both `.webp` files, `people.ts` and `people.spec.ts` together.

The layout handles any number of officers on its own: three to a row, two on phones, with a short last row centred. Never adjust the CSS to fit a new person in.
