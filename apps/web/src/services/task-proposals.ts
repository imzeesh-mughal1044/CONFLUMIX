import { tasks } from "@/data/tasks";
import {
  findAuthoredTask,
  readAuthoredTasks,
  saveAuthoredTask,
} from "@/services/task-authoring";
import { findTask } from "@/services/tasks";
import type {
  AuthoredTask,
  ProposalEligibility,
  TaskDetail,
  TaskProposal,
} from "@/types/tasks";

const storageKey = "conflumix.tasks.proposals.v1";
const today = "2026-11-04";
export const taskProposalEvent = "conflumix-task-proposals";

export type ProposalInput = Pick<
  TaskProposal,
  "approach" | "experience" | "completionDate" | "proposedCompensation"
>;

export function readTaskProposals(): TaskProposal[] {
  if (typeof window === "undefined") return [];
  try {
    const records = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

function write(records: TaskProposal[]) {
  localStorage.setItem(storageKey, JSON.stringify(records));
  window.dispatchEvent(new Event(taskProposalEvent));
}

export type ProposalActionResult =
  | { ok: true; task: AuthoredTask; proposal: TaskProposal }
  | {
      ok: false;
      code: "not-found" | "unauthorized" | "lifecycle" | "conflict";
      message: string;
    };

export function getProposalById(id: string) {
  return readTaskProposals().find((proposal) => proposal.id === id);
}

export function getProposalsForTask(taskId: string, includeDrafts = false) {
  return readTaskProposals().filter(
    (proposal) =>
      proposal.taskId === taskId &&
      (includeDrafts || proposal.status !== "draft"),
  );
}

export function getProposalsBySolver(email: string, includeDrafts = false) {
  const normalized = email.trim().toLowerCase();
  return readTaskProposals().filter(
    (proposal) =>
      proposal.solverEmail.toLowerCase() === normalized &&
      (includeDrafts || proposal.status !== "draft"),
  );
}

function ownerMatches(task: TaskDetail, email: string, fullName: string) {
  const authored = findAuthoredTask(task.id);
  if (authored)
    return authored.ownerEmail.toLowerCase() === email.toLowerCase();
  return task.owner.trim().toLowerCase() === fullName.trim().toLowerCase();
}

export function proposalEligibility(
  task: TaskDetail | undefined,
  session: { email: string; fullName: string } | null,
): ProposalEligibility {
  if (!task)
    return {
      allowed: false,
      reason: "not-found",
      message: "This task could not be found in the current catalogue.",
    };
  if (!session)
    return {
      allowed: false,
      reason: "authentication",
      message: "Sign in before submitting a proposal.",
    };
  if (ownerMatches(task, session.email, session.fullName))
    return {
      allowed: false,
      reason: "owner",
      message: "You cannot submit a proposal to a task you own.",
    };
  if (task.status !== "open" || task.deadline < today)
    return {
      allowed: false,
      reason: "lifecycle",
      message:
        task.deadline < today
          ? "This task's deadline has passed, so it no longer accepts proposals."
          : "This task is not currently accepting proposals.",
    };
  const existing = getProposalsBySolver(session.email, true).find(
    (proposal) => proposal.taskId === task.id,
  );
  if (existing && existing.status !== "draft")
    return {
      allowed: false,
      reason: "duplicate",
      message: "You have already submitted a proposal for this task.",
      existing,
    };
  return { allowed: true, draft: existing };
}

function upsert(proposal: TaskProposal) {
  const records = readTaskProposals();
  const index = records.findIndex((item) => item.id === proposal.id);
  if (index >= 0) records[index] = proposal;
  else records.unshift(proposal);
  write(records);
  return proposal;
}

export function saveProposalDraft(
  task: TaskDetail,
  session: { email: string; fullName: string },
  input: ProposalInput,
) {
  const eligibility = proposalEligibility(task, session);
  if (!eligibility.allowed) return eligibility;
  const now = new Date().toISOString();
  return upsert({
    id: eligibility.draft?.id ?? `proposal-${Date.now()}`,
    taskId: task.id,
    solverEmail: session.email,
    solverName: session.fullName,
    ...input,
    currency: "PKR",
    status: "draft",
    createdAt: eligibility.draft?.createdAt ?? now,
    updatedAt: now,
    latestUpdate: "Draft saved",
  });
}

export function submitProposal(
  task: TaskDetail,
  session: { email: string; fullName: string },
  input: ProposalInput,
) {
  const eligibility = proposalEligibility(task, session);
  if (!eligibility.allowed) return eligibility;
  const now = new Date().toISOString();
  return upsert({
    id: eligibility.draft?.id ?? `proposal-${Date.now()}`,
    taskId: task.id,
    solverEmail: session.email,
    solverName: session.fullName,
    ...input,
    currency: "PKR",
    status: "pending",
    createdAt: eligibility.draft?.createdAt ?? now,
    submittedAt: now,
    updatedAt: now,
    latestUpdate: "Submitted",
  });
}

export function canWithdrawProposal(proposal: TaskProposal) {
  return proposal.status === "pending";
}

export function withdrawProposal(id: string, solverEmail: string) {
  const proposal = getProposalById(id);
  if (
    !proposal ||
    proposal.solverEmail.toLowerCase() !== solverEmail.toLowerCase() ||
    !canWithdrawProposal(proposal)
  )
    return false;
  upsert({
    ...proposal,
    status: "withdrawn",
    latestUpdate: "Withdrawn",
    updatedAt: new Date().toISOString(),
  });
  return true;
}

function ownsTask(
  task: TaskDetail,
  owner: { email: string; fullName: string },
) {
  const authored = findAuthoredTask(task.id);
  return authored
    ? authored.ownerEmail.toLowerCase() === owner.email.toLowerCase()
    : task.owner.trim().toLowerCase() === owner.fullName.trim().toLowerCase();
}

function authoredForSelection(
  task: TaskDetail,
  owner: { email: string; fullName: string },
): AuthoredTask {
  const existing = findAuthoredTask(task.id);
  if (existing) return existing;
  return {
    ...task,
    ownerEmail: owner.email,
    authoringCategory: task.category,
    experience: "Intermediate",
    capability: task.requirements.join("\n"),
    duration: "1–3 days",
    budgetType: "Fixed price",
    compensationConditions: "",
    categoryFields: {},
    status: task.status === "closed" ? "closed" : "open",
    updatedAt: new Date().toISOString(),
  };
}

export function selectSolver(
  taskId: string,
  proposalId: string,
  owner: { email: string; fullName: string },
): ProposalActionResult {
  const task = findTask(taskId);
  if (!task)
    return {
      ok: false,
      code: "not-found",
      message: "The task no longer exists.",
    };
  if (!ownsTask(task, owner))
    return {
      ok: false,
      code: "unauthorized",
      message: "Only the task owner can select a solver.",
    };
  const records = readTaskProposals();
  const proposal = records.find(
    (item) => item.id === proposalId && item.taskId === task.id,
  );
  if (!proposal)
    return {
      ok: false,
      code: "not-found",
      message: "This proposal is no longer available.",
    };
  const selected = records.find(
    (item) => item.taskId === task.id && item.status === "accepted",
  );
  const authored = findAuthoredTask(task.id);
  if (
    selected ||
    authored?.selectedProposalId ||
    task.status === "solver-selected"
  )
    return {
      ok: false,
      code: "conflict",
      message: `A solver${selected ? ` (${selected.solverName})` : ""} has already been selected for this task.`,
    };
  if (
    proposal.status !== "pending" ||
    !["open", "reviewing"].includes(task.status)
  )
    return {
      ok: false,
      code: "lifecycle",
      message: "This proposal or task is no longer eligible for selection.",
    };
  const now = new Date().toISOString();
  const updated = records.map((item) =>
    item.taskId !== task.id
      ? item
      : item.id === proposal.id
        ? {
            ...item,
            status: "accepted" as const,
            latestUpdate: "Accepted",
            updatedAt: now,
          }
        : item.status === "pending"
          ? {
              ...item,
              status: "rejected" as const,
              latestUpdate: "Not selected",
              updatedAt: now,
            }
          : item,
  );
  const selectedProposal = updated.find(
    (item) => item.id === proposal.id,
  ) as TaskProposal;
  const nextTask: AuthoredTask = {
    ...authoredForSelection(task, owner),
    status: "solver-selected",
    selectedProposalId: selectedProposal.id,
    selectedSolver: selectedProposal.solverName,
    selectedAt: now,
    updatedAt: now,
  };
  write(updated);
  saveAuthoredTask(nextTask);
  return { ok: true, task: nextTask, proposal: selectedProposal };
}

export function rejectProposal(
  taskId: string,
  proposalId: string,
  owner: { email: string; fullName: string },
): ProposalActionResult {
  const task = findTask(taskId);
  if (!task)
    return {
      ok: false,
      code: "not-found",
      message: "The task no longer exists.",
    };
  if (!ownsTask(task, owner))
    return {
      ok: false,
      code: "unauthorized",
      message: "Only the task owner can reject this proposal.",
    };
  const records = readTaskProposals();
  const proposal = records.find(
    (item) => item.id === proposalId && item.taskId === task.id,
  );
  if (!proposal)
    return {
      ok: false,
      code: "not-found",
      message: "This proposal is no longer available.",
    };
  if (proposal.status !== "pending")
    return {
      ok: false,
      code: "lifecycle",
      message: "Only a pending proposal can be rejected.",
    };
  const now = new Date().toISOString();
  const rejected: TaskProposal = {
    ...proposal,
    status: "rejected",
    latestUpdate: "Rejected",
    updatedAt: now,
  };
  write(records.map((item) => (item.id === proposal.id ? rejected : item)));
  return {
    ok: true,
    task: authoredForSelection(task, owner),
    proposal: rejected,
  };
}

export function getTasksByOwner(
  email: string,
  fullName: string,
): Array<TaskDetail | AuthoredTask> {
  const normalizedEmail = email.toLowerCase();
  const local = readAuthoredTasks().filter(
    (task) => task.ownerEmail.toLowerCase() === normalizedEmail,
  );
  const fixtureTasks = tasks
    .filter(
      (task) => task.owner.toLowerCase() === fullName.trim().toLowerCase(),
    )
    .flatMap((task) => {
      const detail = findTask(task.id);
      return detail ? [detail] : [];
    });
  return [...local, ...fixtureTasks].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
