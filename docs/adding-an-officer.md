# Adding an officer

How to put a new officer in the "who's running this" section of the home page, and how to change or remove one. It takes about ten minutes: one photo, two edits, one test run.

## What you need

| | Example |
| :-- | :-- |
| Their name, as it should appear | `Kaiden Rudolph` |
| Their role, lowercase the way the page writes it | `tech officer` |
| A profile link: LinkedIn, or the WMU directory for faculty | `https://www.linkedin.com/in/kaiden-rudolph-6b3553246/` |
| A headshot: JPG, PNG or WebP, face clearly visible | any phone photo works |

The photo file can be any size; the script crops and shrinks it. iPhone photos in HEIC format need exporting as JPG first.

## 1. Make the headshot

Every headshot is a square, saved twice:

- `public/officers/<slug>-160.webp`
- `public/officers/<slug>-320.webp`

The slug is their name in lowercase with dashes, like `kaiden-rudolph`. The site crops each one to a circle.

```sh
npm run officer-photo -- path/to/photo.jpg kaiden-rudolph
```

This writes both files and prints three things:

- the photo's size
- the square it cut out
- the path to a preview image showing the new headshot, ringed in red, next to everyone else's

The first run takes the biggest square that fits. Look at the preview; the new photo should match the others:

- **The head fills about the top half to 55%** of the square, with a little space above the hair.
- **The eyes are about a third of the way down.**
- **The face is centred** side to side, with the shoulders showing at the bottom.

If it doesn't match, run it again with `--crop left,top,size`. That's a square in the photo's own pixels: its left edge, its top edge, and its side length.

```sh
# Kaiden's photo is 1916x2000; this square frames his head like the others
npm run officer-photo -- path/to/photo.jpg kaiden-rudolph --crop 250,97,1660
```

- A smaller `size` zooms in.
- A bigger `left` moves the frame right; a bigger `top` moves it down.

Repeat until the preview looks right. Each run overwrites the files.

The script uses the same Chromium as the tests. If it can't find a browser, run `npx playwright install chromium` once. To crop by hand instead, the ImageMagick command in the README's [Updating the site](../README.md#officers-photos-and-links-srcdatapeoplets) section makes the same two files.

## 2. Add them to the site

In `src/data/people.ts`, add an entry to `OFFICERS`:

```ts
  {
    name: "Kaiden Rudolph",
    role: "tech officer",
    href: "https://www.linkedin.com/in/kaiden-rudolph-6b3553246/",
    photo: "kaiden-rudolph", // the slug from step 1
    tilt: -1.2,
  },
```

- **Order** is the order on the page: faculty advisor, president, vice president, then the other officers. A new officer usually goes at the end.
- **`tilt`** is how many degrees the photo is turned, so the row looks pinned up by hand rather than stamped. Pick something between -2 and 2, with the opposite sign from the person before them.
- **Two people can share a role.** Write it the same way for both.

## 3. Add them to the test

`tests/people.spec.ts` keeps its own list of who should be on the page, in order. Add the same person there:

```ts
  ["Kaiden Rudolph", "tech officer", "https://www.linkedin.com/in/kaiden-rudolph-6b3553246/", "kaiden-rudolph"],
```

## 4. Check it

```sh
npm test       # every officer has a name, role, link and a loaded, circular photo
npm run dev    # then look at "who's running this" on the home page, wide and narrow
```

Officers sit three to a row, two on phones. A short last row centres itself, so any number of officers lays out on its own.

Commit four files:

- both `.webp` files
- `src/data/people.ts`
- `tests/people.spec.ts`

## What updates on its own

- The officers section on the home page.
- The officers list in [`/llms-full.txt`](https://qbronco.com/llms-full.txt), the plain-text version of the site for AI assistants.

Nothing else on the site lists officers.

## Changing or removing an officer

| To... | Do this |
| :-- | :-- |
| Change a role or link | Edit their entry in `people.ts` and their row in `people.spec.ts`. |
| Change their photo | Run step 1 again with the same slug; it overwrites the old files. |
| Remove someone | Delete their entry, their test row, and both of their `.webp` files. |

## Checklist

- [ ] `public/officers/<slug>-160.webp` and `-320.webp` made, and the preview looks like the others
- [ ] Entry added to `OFFICERS` in `src/data/people.ts`
- [ ] Row added to `OFFICERS` in `tests/people.spec.ts`
- [ ] `npm test` passes
