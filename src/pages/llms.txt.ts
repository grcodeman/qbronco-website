import type { APIRoute } from "astro";
import { llmsSummary } from "../data/llms";

// the short, plain-text version of the site for AI assistants (llmstxt.org)
export const GET: APIRoute = ({ site }) =>
  new Response(llmsSummary((site ?? new URL("https://qbronco.com")).origin), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
