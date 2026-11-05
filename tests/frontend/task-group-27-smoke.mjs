import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(new URL("../../apps/web/package.json", import.meta.url));
const { chromium } = require("playwright");
const browser = await chromium.launch({ headless: true, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
const base = "http://127.0.0.1:3003";

function seed() {
  localStorage.setItem("conflumix.frontend.session", JSON.stringify({ email: "solver@example.com", fullName: "Test Solver" }));
  const common = {
    owner: "Test Solver", ownerEmail: "solver@example.com", arrangement: "Remote", locality: "Lahore",
    category: "Programming", skills: ["React", "CSS"], budget: 12000, deadline: "2026-12-20",
    expectedDeliverable: "A tested responsive implementation.", requirements: ["Preserve existing behavior."],
    submissionExpectation: "Share source files and a concise note.", authoringCategory: "web-development",
    experience: "Intermediate", capability: "Responsive frontend development", duration: "1–3 days",
    budgetType: "Fixed price", compensationConditions: "Paid after review", categoryFields: {}, updatedAt: "2026-11-04T12:00:00.000Z",
  };
  if (!localStorage.getItem("conflumix.tasks.authored.v1")) localStorage.setItem("conflumix.tasks.authored.v1", JSON.stringify([
    { ...common, id: "owned-open", slug: "owned-open-task", title: "Build an owned responsive page", description: "Create and test a focused responsive page for the community programme.", status: "open", createdAt: "2026-11-03T12:00:00.000Z" },
    { ...common, id: "owned-draft", slug: "owned-draft-task", title: "Draft task for later", description: "A draft task that has not been published to the public marketplace yet.", status: "draft", createdAt: "2026-11-02T12:00:00.000Z" },
  ]));
  const proposal = (id, taskId, status, latestUpdate) => ({
    id, taskId, solverEmail: "solver@example.com", solverName: "Test Solver",
    approach: "I will review the supplied material, complete the requested work in clear stages, verify the result, and provide a concise handover note.",
    experience: "I have completed similar focused digital tasks for community teams.", completionDate: "2026-11-15",
    proposedCompensation: 7000, currency: "PKR", status, createdAt: "2026-11-04T10:00:00.000Z",
    submittedAt: "2026-11-04T10:00:00.000Z", updatedAt: "2026-11-04T10:00:00.000Z", latestUpdate,
  });
  if (!localStorage.getItem("conflumix.tasks.proposals.v1")) localStorage.setItem("conflumix.tasks.proposals.v1", JSON.stringify([
    proposal("accepted-proposal", "task-003", "accepted", "Accepted"),
    proposal("rejected-proposal", "task-005", "rejected", "Rejected"),
    proposal("withdrawn-proposal", "task-006", "withdrawn", "Withdrawn"),
    proposal("completed-proposal", "task-009", "completed", "Completed"),
    { ...proposal("owner-count-proposal", "owned-open", "pending", "Submitted"), solverEmail: "another@example.com", solverName: "Another Solver" },
  ]));
}

const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.addInitScript(seed);
await page.goto(`${base}/tasks/task-002`);
await page.getByRole("link", { name: "Submit Proposal" }).click();
await page.getByRole("heading", { name: "Submit Proposal" }).waitFor();
assert.match(await page.getByRole("heading", { name: "Debug a small Python CSV script" }).innerText(), /Python CSV/);
await page.locator("#approach").fill("I will reproduce the skipped-row issue, inspect the parser assumptions, correct the CSV handling, test representative input cases, and provide the updated script with a clear explanation.");
await page.locator("#experience").fill("I have debugged Python data-processing scripts and documented parsing fixes.");
await page.locator("#completionDate").fill("2026-11-10");
await page.locator("#compensation").fill("8500");
await page.getByRole("button", { name: "Save Draft" }).click();
await page.getByText("Proposal draft saved in this browser.").waitFor();
await page.reload();
await page.getByText("Your browser-local proposal draft has been restored.").waitFor();
await page.getByRole("button", { name: "Submit Proposal" }).click();
await page.getByRole("heading", { name: "My Proposals" }).waitFor();
await page.getByText("Proposal submitted. The task owner can now review it.").waitFor();
await page.goto(`${base}/tasks/task-002/propose`);
await page.getByRole("heading", { name: "Proposal unavailable" }).waitFor();
await page.getByText("You have already submitted a proposal for this task.").waitFor();
await page.goto(`${base}/tasks/owned-open-task/propose`);
await page.getByText("You cannot submit a proposal to a task you own.").waitFor();
await page.goto(`${base}/tasks/task-009/propose`);
await page.getByText("This task is not currently accepting proposals.").waitFor();
await page.goto(`${base}/tasks/task-008/propose`);
await page.getByText("deadline has passed").waitFor();

await page.goto(`${base}/dashboard/tasks/posted`);
await page.getByRole("heading", { name: "My Posted Tasks" }).waitFor();
assert.equal(await page.getByRole("row", { name: /Build an owned responsive page/ }).count(), 1);
assert.equal(await page.getByText("Another Solver").count(), 0);
assert.equal(await page.getByRole("link", { name: "Review Proposals" }).count(), 1);
await page.getByRole("button", { name: "Receiving proposals" }).click();
assert.equal(await page.getByText("Build an owned responsive page").count() > 0, true);

await page.goto(`${base}/dashboard/tasks/proposals`);
for (const filter of ["Pending", "Accepted", "Rejected", "Withdrawn", "Completed / historical"]) {
  await page.getByRole("button", { name: new RegExp(`^${filter}`) }).click();
}
await page.getByRole("button", { name: /^All/ }).click();
await page.getByRole("button", { name: "View Proposal" }).first().click();
await page.getByRole("dialog").getByRole("heading", { level: 2 }).waitFor();
await page.getByRole("button", { name: "Close proposal details" }).click();
const pendingCard = page.locator("article").filter({ hasText: "Debug a small Python CSV script" });
await pendingCard.getByRole("button", { name: "Withdraw Proposal" }).click();
await page.getByRole("heading", { name: "Withdraw this proposal?" }).waitFor();
await page.getByRole("dialog").getByRole("button", { name: "Withdraw Proposal" }).click();
await page.getByRole("button", { name: /^Withdrawn/ }).click();
assert.equal(await page.getByText("Debug a small Python CSV script").count() > 0, true);
await page.close();

for (const viewport of [
  { width: 360, height: 740 }, { width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1280, height: 800 }, { width: 1440, height: 900 },
]) {
  const responsivePage = await browser.newPage({ viewport });
  await responsivePage.addInitScript(seed);
  for (const path of ["/tasks/task-002/propose", "/dashboard/tasks/posted", "/dashboard/tasks/proposals"]) {
    await responsivePage.goto(`${base}${path}`);
    await responsivePage.locator("h1").waitFor();
    assert.equal(await responsivePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${path} overflowed at ${viewport.width}px`);
  }
  await responsivePage.close();
}

await browser.close();
console.log("Group 27 proposal and personal task workflow checks passed at 360, 390, 768, 1280, and 1440px.");
