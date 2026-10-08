import type { APIRoute } from "astro";
import { CLUB } from "../data/people";

// The web app manifest: what a phone calls the site and which icon it uses
// when someone adds qbronco.com to their home screen (or installs it from
// Chrome). Long-pressing the icon offers the schedule and the project.
// Icons are made by `npm run icons` and sit inside the maskable safe zone, so
// the same files serve as both plain and maskable icons.

const PAPER = "#fcfbf4";

const icons = [192, 512].flatMap((size) =>
  ["any", "maskable"].map((purpose) => ({
    src: `/icon-${size}.png`,
    sizes: `${size}x${size}`,
    type: "image/png",
    purpose,
  })),
);

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      {
        id: "/",
        name: `${CLUB.name} (${CLUB.alsoKnownAs[0]})`,
        short_name: CLUB.name,
        description: CLUB.summary,
        lang: "en-US",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: PAPER,
        theme_color: PAPER,
        categories: ["education"],
        icons,
        shortcuts: [
          { name: "The schedule", short_name: "Schedule", url: "/schedule" },
          { name: "The project", short_name: "Project", url: "/project" },
        ],
      },
      null,
      2,
    ),
    { headers: { "Content-Type": "application/manifest+json; charset=utf-8" } },
  );
