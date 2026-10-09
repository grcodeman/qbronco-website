import { expect, test } from "@playwright/test";

// The ways in, for each kind of visitor: a student can sign up or just show up
// from any page, anyone can email the club, companies and faculty have a
// section that says how to help, and new members know what to bring.

const EMAIL = "mukaddas.usmanova@wmich.edu";
const SIGNUP = /^https:\/\/docs\.google\.com\/forms\//;

test("every page ends with the sign-up form, the club's email and its profiles", async ({ page }) => {
  for (const path of ["/", "/schedule", "/project", "/404"]) {
    await page.goto(path);
    const foot = page.locator("footer .foot-join");
    await expect(foot).toContainText("want in?");
    await expect(foot.getByRole("link", { name: /sign me up/ })).toHaveAttribute("href", SIGNUP);
    await expect(foot.getByRole("link", { name: EMAIL })).toHaveAttribute("href", `mailto:${EMAIL}`);
    for (const name of ["instagram", "experienceWMU", "linkedin", "github"]) {
      await expect(foot.getByRole("link", { name, exact: true })).toHaveAttribute("rel", /noopener/);
    }
  }
});

test("the home page lists the email with the other contacts and says whose it is", async ({ page }) => {
  await page.goto("/");
  const email = page.locator(".contacts li").first();
  await expect(email).toContainText(`email: ${EMAIL}`);
  await expect(email).toContainText("Mack, our president");
  await expect(email.getByRole("link")).toHaveAttribute("href", `mailto:${EMAIL}`);
});

test("companies and faculty get a work-with-us section with the email and the advisor", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("section", { has: page.getByRole("heading", { name: "work with us" }) });
  await expect(section).toContainText("speaker nights");
  await expect(section).toContainText("IBM Qiskit hackathon");
  await expect(section.getByRole("link", { name: EMAIL })).toHaveAttribute("href", `mailto:${EMAIL}`);
  await expect(section.getByRole("link", { name: "Dr. Sawalha" })).toHaveAttribute(
    "href",
    "https://wmich.edu/electrical-computer/directory/sawalha",
  );
});

test("a first-timer is told what to bring and that joining late is fine", async ({ page }) => {
  for (const path of ["/", "/schedule"]) {
    await page.goto(path);
    const note = page.locator("p", { hasText: "first time?" });
    await expect(note).toContainText("bring a laptop and a notebook");
    await expect(note).toContainText("join a subteam and we'll give you the material to get caught up");
  }
});

test("the project page links the GitHub repo the programmer subteam starts in", async ({ page }) => {
  await page.goto("/project");
  await expect(page.getByRole("link", { name: "the GitHub repo" })).toHaveAttribute("href", "https://github.com/qbronco");
});

test("search engines and AI assistants get the email too", async ({ page, request }) => {
  await page.goto("/");
  const graph = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((els) => els.flatMap((el) => JSON.parse(el.textContent!)["@graph"]));
  const club = graph.find((n) => n["@type"] === "Organization");
  expect(club.email).toBe(EMAIL);
  expect(club.contactPoint.email).toBe(EMAIL);

  for (const file of ["/llms.txt", "/llms-full.txt"]) {
    const body = await (await request.get(file)).text();
    expect(body).toContain(`- [Email: ${EMAIL}](mailto:${EMAIL})`);
    expect(body).toContain("bring a laptop and a notebook");
  }
  const full = await (await request.get("/llms-full.txt")).text();
  expect(full).toContain("## Working with the club");
  expect(full).toContain("Code: https://github.com/qbronco");
});
