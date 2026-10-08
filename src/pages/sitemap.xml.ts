import type { APIRoute } from "astro";

// the three pages worth indexing (the 404 and the /calendar redirect are not)
const PAGES = ["/", "/schedule", "/project"];

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL("https://qbronco.com")).origin;
  const today = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map((path) => `  <url><loc>${origin}${path}</loc><lastmod>${today}</lastmod></url>`);
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
