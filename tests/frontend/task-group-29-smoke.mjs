import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../apps/web/package.json", import.meta.url));
const { chromium } = require("playwright");
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
const base = "http://127.0.0.1:3004";

function seed({ role = "owner", status = "submitted" } = {}) {
  const sessions = { owner: { email: "owner@example.com", fullName: "Task Owner" }, solver: { email: "solver@example.com", fullName: "Selected Solver" }, stranger: { email: "stranger@example.com", fullName: "Other Member" } };
  localStorage.setItem("conflumix.frontend.session", JSON.stringify(sessions[role]));
  localStorage.setItem("conflumix.tasks.authored.v1", JSON.stringify([{
    id: "work-task", slug: "focused-community-report", title: "Prepare a focused community research report with a deliberately long title", description: "Research the supplied community programme material and produce a concise evidence-based report that preserves source links.", category: "Research", skills: ["Research", "Writing"], budget: 14000, deadline: "2026-12-20", status, owner: "Task Owner", ownerEmail: "owner@example.com", arrangement: "Remote", locality: "Lahore", createdAt: "2026-11-01T09:00:00.000Z", expectedDeliverable: "An editable report and a polished PDF with traceable source links.", requirements: ["Use current traceable sources.", "Separate factual findings from interpretation.", "Keep the final report under twelve pages."], submissionExpectation: "Provide the editable document, final PDF, and source index.", authoringCategory: "research", experience: "Intermediate", capability: "Clear source-linked research", duration: "About a week", budgetType: "Fixed price", compensationConditions: "After accepted delivery", categoryFields: {}, selectedProposalId: "accepted-work", selectedSolver: "Selected Solver", selectedAt: "2026-11-03T10:00:00.000Z", updatedAt: "2026-11-04T10:00:00.000Z"
  }, {
    id: "no-solver", slug: "task-without-selected-solver", title: "Task without a selected solver", description: "This remains open for proposals.", category: "Writing", skills: ["Writing"], budget: 5000, deadline: "2026-12-20", status: "open", owner: "Task Owner", ownerEmail: "owner@example.com", arrangement: "Remote", locality: "Lahore", createdAt: "2026-11-02T09:00:00.000Z", expectedDeliverable: "One document.", requirements: ["Use clear language."], submissionExpectation: "Provide an editable file.", authoringCategory: "writing", experience: "Beginner", capability: "Writing", duration: "1–3 days", budgetType: "Fixed price", compensationConditions: "", categoryFields: {}, updatedAt: "2026-11-02T09:00:00.000Z"
  }]));
  localStorage.setItem("conflumix.tasks.proposals.v1", JSON.stringify([{ id: "accepted-work", taskId: "work-task", solverEmail: "solver@example.com", solverName: "Selected Solver", approach: "I will review the sources, structure the findings, draft the report, verify every reference, and supply editable and final formats.", experience: "Five comparable community research briefs.", completionDate: "2026-12-15", proposedCompensation: 13500, currency: "PKR", status: "accepted", createdAt: "2026-11-02T10:00:00.000Z", submittedAt: "2026-11-02T10:00:00.000Z", updatedAt: "2026-11-03T10:00:00.000Z", latestUpdate: "Accepted" }]));
  if (status === "submitted") localStorage.setItem("conflumix.tasks.workrooms.v1", JSON.stringify([{ taskId: "work-task", status: "submitted", submissions: [{ id: "submission-1", taskId: "work-task", version: 1, note: "Initial report, source index, and final PDF are ready for review.", references: ["community-report-v1.docx", "community-report-v1.pdf"], submittedAt: "2026-11-04T09:00:00.000Z", status: "submitted" }], revisions: [], activity: [{ id: "selected", taskId: "work-task", type: "solver-selected", actorName: "Task Owner", occurredAt: "2026-11-03T10:00:00.000Z", detail: "Selected Solver was selected to complete the task." }, { id: "submitted", taskId: "work-task", type: "work-submitted", actorName: "Selected Solver", occurredAt: "2026-11-04T09:00:00.000Z", detail: "Submission 1 was submitted for review." }], updatedAt: "2026-11-04T09:00:00.000Z" }]));
}

async function pageFor(role, status = "submitted", viewport = { width: 1280, height: 800 }) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(seed, { role, status });
  await page.goto(`${base}/dashboard/tasks/work/work-task`);
  await page.locator("h1").waitFor();
  return page;
}

let page = await pageFor("owner");
await page.getByRole("heading", { name: /Prepare a focused community/ }).waitFor();
await page.getByText("Task Owner", { exact: true }).waitFor();
await page.getByText("Selected Solver", { exact: true }).waitFor();
await page.getByRole("button", { name: "Request Revision" }).click();
await page.locator("#revision-instructions").fill("Please add a short methodology note and clarify the evidence behind the second finding.");
await page.getByRole("button", { name: "Confirm Revision Request" }).click();
await page.getByText("Revision requested. The solver can now prepare a revised submission.").waitFor();
assert.equal(await page.getByRole("button", { name: "Accept Submission" }).count(), 0);
await page.close();

page = await pageFor("owner");
await page.getByRole("button", { name: "Accept Submission" }).click();
await page.getByRole("button", { name: "Accept and Complete" }).click();
await page.getByText("Submission accepted. The task is complete.").waitFor();
await page.getByText("This workroom is read-only").waitFor();
await page.close();

page = await pageFor("solver", "in-progress");
await page.getByRole("link", { name: "Submit Work" }).waitFor();
assert.equal(await page.getByRole("button", { name: "Request Revision" }).count(), 0);
assert.equal(await page.getByRole("button", { name: "Accept Submission" }).count(), 0);
await page.close();

page = await pageFor("stranger");
await page.getByRole("heading", { name: "Workroom unavailable" }).waitFor();
assert.equal(await page.getByText("Initial report").count(), 0);
await page.close();

page = await pageFor("owner");
await page.goto(`${base}/dashboard/tasks/work/no-solver`);
await page.getByRole("heading", { name: "Workroom not active" }).waitFor();
await page.getByRole("link", { name: "Review Proposals" }).waitFor();
await page.goto(`${base}/dashboard/tasks/work/unknown-task`);
await page.getByRole("heading", { name: "Task not found" }).waitFor();
await page.close();

for (const viewport of [{ width: 360, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
  page = await pageFor("owner", "submitted", viewport);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `Workroom overflowed at ${viewport.width}px`);
  await page.getByRole("button", { name: "Request Revision" }).click();
  const box = await page.getByRole("dialog").boundingBox();
  assert.ok(box && box.width <= viewport.width && box.height <= viewport.height, `Dialog did not fit at ${viewport.width}px`);
  await page.keyboard.press("Escape");
  await page.close();
}

await browser.close();
console.log("Group 29 workroom checks passed for owner, solver, unauthorized, no-solver, lifecycle actions, and 360/390/768/1280/1440px layouts.");
