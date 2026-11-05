import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../apps/web/package.json", import.meta.url));
const { chromium } = require("playwright");
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
const base = "http://127.0.0.1:3005";

function seed({ role = "solver", state = "in-progress" } = {}) {
  if (sessionStorage.getItem("conflumix.group30.seeded")) return;
  sessionStorage.setItem("conflumix.group30.seeded", "1");
  const sessions = { solver: { email: "solver@example.com", fullName: "Selected Solver With A Long Display Name" }, owner: { email: "owner@example.com", fullName: "Task Owner" }, stranger: { email: "other@example.com", fullName: "Other Member" } };
  localStorage.setItem("conflumix.frontend.session", JSON.stringify(sessions[role]));
  localStorage.setItem("conflumix.tasks.authored.v1", JSON.stringify([{ id: "delivery-task", slug: "delivery-task", title: "Prepare a detailed community research report with a long descriptive title", description: "Prepare a concise evidence-based community report.", category: "Research", skills: ["Research", "Writing"], budget: 15000, deadline: "2026-12-20", status: state === "revision" ? "revision" : state === "completed" ? "completed" : state === "submitted" ? "submitted" : "in-progress", owner: "Task Owner", ownerEmail: "owner@example.com", arrangement: "Remote", locality: "Lahore", createdAt: "2026-11-01T09:00:00.000Z", expectedDeliverable: "An editable report, final PDF, and traceable source index.", requirements: ["Use traceable sources.", "Keep the report under twelve pages."], submissionExpectation: "Provide final references and clear review instructions.", authoringCategory: "research", experience: "Intermediate", capability: "Source-linked research", duration: "About a week", budgetType: "Fixed price", compensationConditions: "After accepted delivery", categoryFields: {}, selectedProposalId: "accepted-delivery", selectedSolver: "Selected Solver With A Long Display Name", selectedAt: "2026-11-03T10:00:00.000Z", updatedAt: "2026-11-04T10:00:00.000Z" }]));
  localStorage.setItem("conflumix.tasks.proposals.v1", JSON.stringify([{ id: "accepted-delivery", taskId: "delivery-task", solverEmail: "solver@example.com", solverName: "Selected Solver With A Long Display Name", approach: "Research, draft, verify each source, and provide editable and final formats.", experience: "Several similar reports.", completionDate: "2026-12-15", proposedCompensation: 14500, currency: "PKR", status: "accepted", createdAt: "2026-11-02T10:00:00.000Z", submittedAt: "2026-11-02T10:00:00.000Z", updatedAt: "2026-11-03T10:00:00.000Z", latestUpdate: "Accepted" }]));
  const first = { id: "submission-1", taskId: "delivery-task", version: 1, message: "The first report version is ready for owner review.", deliverableDescription: "Editable report, PDF export, and source index with referenced findings.", links: ["https://example.com/a/very/long/deliverable/reference/path/that/must/wrap"], completionNotes: "Review the methodology section first.", submittedAt: "2026-11-04T09:00:00.000Z", status: state === "completed" ? "accepted" : state === "revision" ? "revision-requested" : "submitted" };
  if (state !== "in-progress") localStorage.setItem("conflumix.tasks.workrooms.v1", JSON.stringify([{ taskId: "delivery-task", status: state, submissions: [first], revisions: state === "revision" ? [{ id: "revision-1", taskId: "delivery-task", submissionId: "submission-1", instructions: "Add a methodology note and clarify the evidence supporting the second finding with a traceable source.", requestedAt: "2026-11-04T12:00:00.000Z" }] : [], activity: [{ id: "selected", taskId: "delivery-task", type: "solver-selected", actorName: "Task Owner", occurredAt: "2026-11-03T10:00:00.000Z", detail: "Selected Solver With A Long Display Name was selected to complete the task." }, { id: "submitted", taskId: "delivery-task", type: "work-submitted", actorName: "Selected Solver With A Long Display Name", occurredAt: "2026-11-04T09:00:00.000Z", detail: "Work submitted as Submission 1." }, ...(state === "revision" ? [{ id: "revision-event", taskId: "delivery-task", type: "revision-requested", actorName: "Task Owner", occurredAt: "2026-11-04T12:00:00.000Z", detail: "Revision requested for Submission 1." }] : []), ...(state === "completed" ? [{ id: "accepted", taskId: "delivery-task", type: "submission-accepted", actorName: "Task Owner", occurredAt: "2026-11-05T09:00:00.000Z", detail: "Submission 1 was accepted and the task was completed." }] : [])], updatedAt: "2026-11-05T09:00:00.000Z" }]));
}

async function open(role, state, path, viewport = { width: 1280, height: 800 }) { const page = await browser.newPage({ viewport }); await page.addInitScript(seed, { role, state }); await page.goto(`${base}${path}`); await page.locator("h1").waitFor(); return page; }

let page = await open("solver", "in-progress", "/dashboard/tasks/work/delivery-task");
await page.getByRole("link", { name: "Submit Work" }).click();
await page.getByRole("heading", { name: "Submit deliverable" }).waitFor();
assert.equal(await page.getByText("File attachments are unavailable").count(), 1);
await page.getByRole("button", { name: "Submit Deliverable" }).click();
await page.getByText(/at least 20 characters/).first().waitFor();
await page.locator("#submission-message").fill("The completed community report and source index are ready for review.");
await page.locator("#submission-description").fill("An editable document, polished PDF, and traceable source index covering all requested findings.");
await page.locator("#submission-links").fill("not-a-url");
await page.getByRole("button", { name: "Submit Deliverable" }).click();
await page.getByText("Each link must be a complete HTTPS URL, one per line.").waitFor();
await page.locator("#submission-links").fill("https://example.com/deliverable");
await page.locator("#submission-notes").fill("Review the methodology note before the findings.");
await page.getByRole("button", { name: "Submit Deliverable" }).click();
const confirm = page.getByRole("button", { name: "Confirm Submission" });
await confirm.dblclick();
await page.getByRole("heading", { name: /Prepare a detailed community/ }).waitFor();
await page.getByText("Submitted work").waitFor();
assert.equal(await page.getByRole("heading", { name: "Submission 1" }).count(), 1);
const storedCount = await page.evaluate(() => JSON.parse(localStorage.getItem("conflumix.tasks.workrooms.v1") ?? "[]")[0].submissions.length);
assert.equal(storedCount, 1);
await page.close();

page = await open("owner", "in-progress", "/dashboard/tasks/work/delivery-task/submit");
await page.getByRole("heading", { name: "Submission unavailable" }).waitFor();
assert.equal(await page.locator("#submission-message").count(), 0);
await page.close();
page = await open("stranger", "in-progress", "/dashboard/tasks/work/delivery-task/history");
await page.getByRole("heading", { name: "History unavailable" }).waitFor();
assert.equal(await page.getByText("source index").count(), 0);
await page.close();

page = await open("solver", "revision", "/dashboard/tasks/work/delivery-task/submit");
await page.getByText("Changes required before resubmission").waitFor();
await page.getByText(/Add a methodology note/).waitFor();
await page.locator("#submission-message").fill("The requested methodology and evidence changes are now complete.");
await page.locator("#submission-description").fill("Revised report with an added methodology section and traceable evidence for the second finding.");
await page.getByRole("button", { name: "Submit Deliverable" }).click();
await page.getByRole("button", { name: "Confirm Submission" }).click();
await page.getByRole("heading", { name: "Submission 2" }).waitFor();
const revisionState = await page.evaluate(() => JSON.parse(localStorage.getItem("conflumix.tasks.workrooms.v1") ?? "[]")[0]);
assert.equal(revisionState.submissions.length, 2);
assert.ok(revisionState.revisions[0].resolvedAt);
assert.equal(revisionState.activity.at(-1).type, "work-resubmitted");
await page.goto(`${base}/dashboard/tasks/work/delivery-task/history`);
await page.getByRole("heading", { name: /Prepare a detailed community/ }).waitFor();
await page.getByRole("button", { name: "View Submission 2" }).click();
await page.getByRole("dialog").getByText("Revised report with an added methodology section").waitFor();
await page.getByRole("button", { name: "Close Submission 2 details" }).click();
await page.close();

page = await open("solver", "completed", "/dashboard/tasks/work/delivery-task/submit");
await page.getByRole("heading", { name: "Completed" }).waitFor();
assert.equal(await page.getByRole("button", { name: "Submit Deliverable" }).count(), 0);
await page.goto(`${base}/dashboard/tasks/work/delivery-task/history`);
await page.getByText("Submission 1 was accepted and the task was completed.").waitFor();
await page.close();

for (const viewport of [{ width: 360, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1280, height: 800 }, { width: 1440, height: 900 }]) {
  for (const path of ["/dashboard/tasks/work/delivery-task/submit", "/dashboard/tasks/work/delivery-task/history"]) {
    page = await open("solver", path.endsWith("history") ? "revision" : "in-progress", path, viewport);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${path} overflowed at ${viewport.width}px`);
    await page.close();
  }
}

await browser.close();
console.log("Group 30 submission/history checks passed for first submit, duplicate prevention, revision resubmit, privacy, completed history, and 360/390/768/1280/1440px layouts.");
