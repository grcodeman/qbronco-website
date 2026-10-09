---
name: add-officer
description: Add a new officer to the QBronco website, or change or remove one (name, role, profile link, headshot). Use when asked to add an officer, update someone's role, link or photo, or take someone off the "who's running this" list on the home page.
---

# Add, change or remove an officer

The steps live in one place, `docs/adding-an-officer.md`. Read it and follow it from start to finish. These notes cover doing it as Claude.

1. **Collect the four things** the guide asks for: name, role, profile link and headshot. Ask only for what's missing, and don't add an officer without a photo.
   - Write the role in lowercase, the way the page does ("tech officer").
   - A photo attached in chat is saved to disk; its path is in the message. Pass that path to the script.
2. **Crop the headshot to 1:1** with `npm run officer-photo -- <photo> <slug>`.
   - Every headshot must be square. The script uses a square photo whole and crops any other shape to the biggest centred square, so never resize, stretch or pad a photo to make it square.
   1. Read the preview image the script prints.
   2. Re-run with `--crop left,top,size` until the head size, eye line and centering match the others. Do this for an already-square photo too if it's framed loosely (head small, lots of background).
   3. If the script warns that the square is under 320px, tell the user the photo will look soft and ask whether they have a bigger one.
   4. Give the user the final preview.
3. **Edit both lists:** `OFFICERS` in `src/data/people.ts` and `OFFICERS` in `tests/people.spec.ts`.
4. **Run `npm test`.**
5. **Show the user a Playwright screenshot in the chat.** Always do this before committing, even when nobody asks.
   1. Run `npm run officers-screenshot`. It builds the site and screenshots the whole "who's running this" section at desktop and Pixel 7 widths, side by side, then prints where the image is.
   2. Read the image and check it: every name and role is there, the photos load, and a short last row is centred.
   3. Send the image to the user in chat (with `SendUserFile` where it's available) so they can see the result without opening the site.
6. **Commit** both `.webp` files, `people.ts` and `people.spec.ts` together.

The layout handles any number of officers on its own: three to a row, two on phones, with a short last row centred. Never adjust the CSS to fit a new person in.
