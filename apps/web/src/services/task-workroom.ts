import { findAuthoredTask, saveAuthoredTask } from "@/services/task-authoring";
import { getProposalsForTask } from "@/services/task-proposals";
import { findTask } from "@/services/tasks";
import type {
  AuthoredTask,
  TaskActivity,
  TaskProposal,
  TaskRevision,
  TaskWorkroom,
  WorkSubmission,
} from "@/types/tasks";

const storageKey = "conflumix.tasks.workrooms.v1";
export const taskWorkroomEvent = "conflumix-task-workroom";
type Session = { email: string; fullName: string };
export type WorkroomContext = {
  task: NonNullable<ReturnType<typeof findTask>>;
  authored?: AuthoredTask;
  proposal?: TaskProposal;
  room?: TaskWorkroom;
  role: "owner" | "solver" | "unauthorized";
};
export type WorkroomActionResult =
  | { ok: true; room: TaskWorkroom }
  | { ok: false; message: string };
export type DeliverableInput = Pick<
  WorkSubmission,
  "message" | "deliverableDescription" | "links" | "completionNotes"
>;

export function readTaskWorkrooms(): TaskWorkroom[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function write(room: TaskWorkroom, task: AuthoredTask) {
  const rooms = readTaskWorkrooms();
  const index = rooms.findIndex((item) => item.taskId === room.taskId);
  if (index >= 0) rooms[index] = room;
  else rooms.push(room);
  localStorage.setItem(storageKey, JSON.stringify(rooms));
  saveAuthoredTask(task);
  window.dispatchEvent(new Event(taskWorkroomEvent));
}

export function getWorkroomContext(
  taskId: string,
  session: Session,
): WorkroomContext | undefined {
  const task = findTask(taskId);
  if (!task) return undefined;
  const authored = findAuthoredTask(task.id);
  const proposal = getProposalsForTask(task.id).find(
    (item) => item.status === "accepted",
  );
  const owner = authored
    ? authored.ownerEmail.toLowerCase() === session.email.toLowerCase()
    : task.owner.toLowerCase() === session.fullName.trim().toLowerCase();
  const solver =
    proposal?.solverEmail.toLowerCase() === session.email.toLowerCase();
  return {
    task,
    authored,
    proposal,
    room: readTaskWorkrooms().find((item) => item.taskId === task.id),
    role: owner ? "owner" : solver ? "solver" : "unauthorized",
  };
}

export function getEffectiveWorkroom(
  context: WorkroomContext,
): TaskWorkroom | undefined {
  if (!context.proposal || !context.authored?.selectedProposalId)
    return undefined;
  return (
    context.room ?? {
      taskId: context.task.id,
      status:
        context.authored.status === "solver-selected"
          ? "solver-selected"
          : "in-progress",
      submissions: [],
      revisions: [],
      activity: [
        {
          id: `activity-selected-${context.task.id}`,
          taskId: context.task.id,
          type: "solver-selected",
          actorName: context.task.owner,
          occurredAt: context.authored.selectedAt ?? context.proposal.updatedAt,
          detail: `${context.proposal.solverName} was selected to complete the task.`,
        },
      ],
      updatedAt: context.authored.selectedAt ?? context.proposal.updatedAt,
    }
  );
}

export function workroomPermissions(context: WorkroomContext) {
  const status = getEffectiveWorkroom(context)?.status;
  return {
    canSubmitWork:
      context.role === "solver" &&
      Boolean(
        status &&
          ["solver-selected", "in-progress", "revision"].includes(status),
      ),
    canRequestRevision: context.role === "owner" && status === "submitted",
    canAcceptSubmission: context.role === "owner" && status === "submitted",
    canCancel:
      context.role === "owner" &&
      Boolean(
        status &&
          ["solver-selected", "in-progress", "revision"].includes(status),
      ),
    readOnly: Boolean(
      status && ["completed", "cancelled", "closed"].includes(status),
    ),
  };
}

function authorizedContext(
  taskId: string,
  session: Session,
  role: "owner" | "solver",
) {
  const context = getWorkroomContext(taskId, session);
  if (!context || context.role !== role)
    return {
      error: "You are not authorized to perform this workroom action.",
    } as const;
  const room = getEffectiveWorkroom(context);
  if (!room || !context.authored)
    return {
      error: "This task does not have an active selected-solver workroom.",
    } as const;
  return { context, room, task: context.authored } as const;
}

function validLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function submitTaskDeliverable(
  taskId: string,
  input: DeliverableInput,
  session: Session,
): WorkroomActionResult {
  const state = authorizedContext(taskId, session, "solver");
  if ("error" in state)
    return { ok: false, message: state.error ?? "Submission unavailable." };
  if (
    !["solver-selected", "in-progress", "revision"].includes(state.room.status)
  )
    return {
      ok: false,
      message: "This task is not currently eligible for a work submission.",
    };
  const message = input.message.trim();
  const deliverableDescription = input.deliverableDescription.trim();
  const completionNotes = input.completionNotes.trim();
  const links = input.links.map((item) => item.trim()).filter(Boolean);
  if (message.length < 20)
    return {
      ok: false,
      message: "Write a submission message of at least 20 characters.",
    };
  if (deliverableDescription.length < 20)
    return {
      ok: false,
      message: "Describe the delivered work in at least 20 characters.",
    };
  if (links.length > 5 || links.some((item) => !validLink(item)))
    return {
      ok: false,
      message: "Provide no more than five valid HTTPS links.",
    };
  const revision =
    state.room.status === "revision"
      ? [...state.room.revisions].reverse().find((item) => !item.resolvedAt)
      : undefined;
  if (state.room.status === "revision" && !revision)
    return {
      ok: false,
      message: "The active revision request could not be resolved.",
    };
  const now = new Date().toISOString();
  const version =
    Math.max(0, ...state.room.submissions.map((item) => item.version)) + 1;
  const submission: WorkSubmission = {
    id: `submission-${Date.now()}`,
    taskId,
    version,
    message,
    deliverableDescription,
    links,
    completionNotes,
    relatedRevisionId: revision?.id,
    submittedAt: now,
    status: "submitted",
  };
  const room: TaskWorkroom = {
    ...state.room,
    status: "submitted",
    submissions: [...state.room.submissions, submission],
    revisions: state.room.revisions.map((item) =>
      item.id === revision?.id ? { ...item, resolvedAt: now } : item,
    ),
    activity: [
      ...state.room.activity,
      event(
        taskId,
        revision ? "work-resubmitted" : "work-submitted",
        session.fullName,
        `${revision ? "Revised work" : "Work"} submitted as Submission ${version}.`,
        now,
      ),
    ],
    updatedAt: now,
  };
  write(room, { ...state.task, status: "submitted", updatedAt: now });
  return { ok: true, room };
}

function event(
  taskId: string,
  type: TaskActivity["type"],
  actorName: string,
  detail: string,
  now: string,
): TaskActivity {
  return {
    id: `activity-${Date.now()}-${type}`,
    taskId,
    type,
    actorName,
    occurredAt: now,
    detail,
  };
}

export function requestTaskRevision(
  taskId: string,
  submissionId: string,
  instructions: string,
  session: Session,
): WorkroomActionResult {
  const state = authorizedContext(taskId, session, "owner");
  if ("error" in state)
    return {
      ok: false,
      message: state.error ?? "Workroom action unavailable.",
    };
  if (state.room.status !== "submitted" || instructions.trim().length < 10)
    return {
      ok: false,
      message:
        "A specific revision request is required for a submitted deliverable.",
    };
  const submission = state.room.submissions.find(
    (item) => item.id === submissionId && item.status === "submitted",
  );
  if (!submission)
    return {
      ok: false,
      message: "The submission is no longer awaiting review.",
    };
  const now = new Date().toISOString();
  const revision: TaskRevision = {
    id: `revision-${Date.now()}`,
    taskId,
    submissionId,
    instructions: instructions.trim(),
    requestedAt: now,
  };
  const room: TaskWorkroom = {
    ...state.room,
    status: "revision",
    submissions: state.room.submissions.map((item) =>
      item.id === submission.id
        ? { ...item, status: "revision-requested" }
        : item,
    ),
    revisions: [...state.room.revisions, revision],
    activity: [
      ...state.room.activity,
      event(
        taskId,
        "revision-requested",
        session.fullName,
        `Revision requested for Submission ${submission.version}.`,
        now,
      ),
    ],
    updatedAt: now,
  };
  write(room, { ...state.task, status: "revision", updatedAt: now });
  return { ok: true, room };
}

export function acceptTaskSubmission(
  taskId: string,
  submissionId: string,
  session: Session,
): WorkroomActionResult {
  const state = authorizedContext(taskId, session, "owner");
  if ("error" in state)
    return {
      ok: false,
      message: state.error ?? "Workroom action unavailable.",
    };
  if (state.room.status !== "submitted")
    return {
      ok: false,
      message: "No submission is currently awaiting acceptance.",
    };
  const submission = state.room.submissions.find(
    (item) => item.id === submissionId && item.status === "submitted",
  );
  if (!submission)
    return {
      ok: false,
      message: "The submission is no longer awaiting review.",
    };
  const now = new Date().toISOString();
  const room: TaskWorkroom = {
    ...state.room,
    status: "completed",
    submissions: state.room.submissions.map((item) =>
      item.id === submission.id ? { ...item, status: "accepted" } : item,
    ),
    activity: [
      ...state.room.activity,
      event(
        taskId,
        "submission-accepted",
        session.fullName,
        `Submission ${submission.version} was accepted and the task was completed.`,
        now,
      ),
    ],
    updatedAt: now,
  };
  write(room, { ...state.task, status: "completed", updatedAt: now });
  return { ok: true, room };
}

export function cancelTaskWork(
  taskId: string,
  session: Session,
): WorkroomActionResult {
  const state = authorizedContext(taskId, session, "owner");
  if ("error" in state)
    return {
      ok: false,
      message: state.error ?? "Workroom action unavailable.",
    };
  if (
    !["solver-selected", "in-progress", "revision"].includes(state.room.status)
  )
    return {
      ok: false,
      message: "This task can no longer be cancelled from the workroom.",
    };
  const now = new Date().toISOString();
  const room: TaskWorkroom = {
    ...state.room,
    status: "cancelled",
    activity: [
      ...state.room.activity,
      event(
        taskId,
        "task-cancelled",
        session.fullName,
        "The owner cancelled the task. Existing history was retained.",
        now,
      ),
    ],
    updatedAt: now,
  };
  write(room, { ...state.task, status: "cancelled", updatedAt: now });
  return { ok: true, room };
}

export function seedWorkroom(room: TaskWorkroom) {
  const task = findAuthoredTask(room.taskId);
  if (!task) return false;
  write(room, { ...task, status: room.status, updatedAt: room.updatedAt });
  return true;
}
