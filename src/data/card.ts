// The link-preview card: public/og.jpg, made by `npm run og`.
//
// Its URL carries a fingerprint of the file (/og.jpg?v=1a2b3c4d). Chat apps
// and social sites keep their own copy of a preview image under its URL, so
// when the card was a screenshot of the site and is now the lab photo, both
// at plain /og.jpg, they kept showing the screenshot. With the fingerprint,
// a new card is a new URL, and anyone who reads the page fetches it.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// read at build time; Astro builds from the project root
const fingerprint = createHash("sha256")
  .update(readFileSync(join(process.cwd(), "public", "og.jpg")))
  .digest("hex")
  .slice(0, 8);

export const CARD = `/og.jpg?v=${fingerprint}`;
