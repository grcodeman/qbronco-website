import type { APIRoute } from "astro";
import { llmsFull } from "../data/llms";

// everything on the site in one plain-text file: schedule, project, officers, FAQ
export const GET: APIRoute = ({ site }) =>
  new Response(llmsFull((site ?? new URL("https://qbronco.com")).origin), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
