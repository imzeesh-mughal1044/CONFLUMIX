import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../apps/web/package.json", import.meta.url));
const { chromium } = require("playwright");
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});

for (const viewport of [
  { width: 360, height: 740 },
  { width: 390, height: 844 },
]) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(() => {
    localStorage.setItem(
      "conflumix.frontend.session",
      JSON.stringify({ email: "owner@example.com", fullName: "Task Owner" }),
    );
  });
  await page.goto("http://127.0.0.1:3002/tasks/new");
  await page.getByRole("heading", { name: "Post a focused task" }).waitFor();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
    true,
  );
  assert.equal(await page.locator("#categoryId optgroup").count(), 7);
  await page.close();
}

const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.addInitScript(() => {
  localStorage.setItem(
    "conflumix.frontend.session",
    JSON.stringify({ email: "owner@example.com", fullName: "Task Owner" }),
  );
});
await page.goto("http://127.0.0.1:3002/tasks/new");
await page.locator("#title").fill("Build a responsive community website");
await page.locator("#categoryId").selectOption("web-development");
await page.locator("#description").fill(
  "Build a clear responsive community website that presents our programme, schedule, and contact details.",
);
await page.locator("#skills").fill("Next.js");
await page.getByRole("button", { name: "Add skill" }).click();
await page.locator("#expectedDeliverable").fill("A tested responsive website and handover notes.");
await page.locator("#capability").fill("Experience building accessible responsive websites.");
await page.locator("#category-field-0").fill("Community information website");
await page.locator("#category-field-1").fill("Full Stack");
await page.locator("#deadline").fill("2026-12-20");
await page.locator("#submissionExpectation").fill("Share a deployed preview and source files.");
await page.locator("#budget").fill("25000");
await page.getByRole("button", { name: "Save Draft" }).click();
await page.getByText("Draft saved in this browser.").waitFor();
await page.reload();
await page.getByText("Your latest browser-local draft has been restored.").waitFor();
assert.equal(await page.locator("#title").inputValue(), "Build a responsive community website");
await page.getByRole("button", { name: "Preview Task" }).click();
await page.getByRole("heading", { name: "How this task will appear" }).waitFor();
await page.getByRole("button", { name: "Close preview" }).click();
await page.getByRole("button", { name: "Publish Task" }).click();
await page.getByRole("heading", { name: "Build a responsive community website" }).waitFor();
const detailUrl = page.url();
await page.goto(`${detailUrl}/edit`);
await page.getByRole("heading", { name: "Edit your task" }).waitFor();
assert.equal(await page.getByRole("button", { name: "Save Draft" }).count(), 0);
await page.getByRole("button", { name: "Close Task" }).click();
await page.getByRole("heading", { name: "Close this task?" }).waitFor();
await page.getByRole("button", { name: "Confirm closure" }).click();
await page.getByText("This task is closed and does not accept proposals.").waitFor();
await page.close();
await browser.close();
console.log("Group 26 task-authoring checks passed at 360x740, 390x844, and 1280x900.");
