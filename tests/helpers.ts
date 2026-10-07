import type { Page } from "@playwright/test";

/** open a page with the browser clock frozen at a given moment */
export async function at(page: Page, iso: string, path = "/") {
  await page.clock.setFixedTime(new Date(iso));
  await page.goto(path);
}

/** blocks whose top edge (or height) isn't a whole number of ruled lines */
export function offRule(page: Page) {
  return page.evaluate(() => {
    const sheet = document.querySelector<HTMLElement>(".page")!;
    const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rule-gap"));
    const selector = [
      "p", "li", "h2", ".wk", ".reel", ".officers", ".terms", ".notes", ".boxed-cta",
      ".page-head", ".title-block", "footer",
    ].map((s) => `.page ${s}`).join(", ");
    const near = (v: number) => v < 0.6 || gap - v < 0.6;
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>(selector)) {
      if (el.closest(".sticky, .polaroid") || el.offsetParent === null) continue;
      let y = 0;
      for (let n: HTMLElement | null = el; n && n !== sheet; n = n.offsetParent as HTMLElement | null) {
        y += n.offsetTop;
      }
      const top = ((y % gap) + gap) % gap;
      // the title blocks are fixed-height on purpose; only their top matters
      const height = el.matches(".page-head, .title-block, footer") ? 0 : el.offsetHeight % gap;
      if (!near(top) || !near(height)) {
        out.push(`${el.tagName.toLowerCase()}.${el.className} "${el.textContent!.trim().slice(0, 30)}" top+${top.toFixed(1)} h+${height.toFixed(1)}`);
      }
    }
    return out;
  });
}
