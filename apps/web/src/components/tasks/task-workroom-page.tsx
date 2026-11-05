"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import {
  acceptTaskSubmission,
  cancelTaskWork,
  getEffectiveWorkroom,
  getWorkroomContext,
  requestTaskRevision,
  taskWorkroomEvent,
  workroomPermissions,
  type WorkroomContext,
} from "@/services/task-workroom";
import { TaskDashboardNav } from "./task-dashboard-nav";
import {
  RevisionHistory,
  SubmissionHistory,
  TaskActivityTimeline,
} from "./task-execution-history";

const date = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const labels: Record<string, string> = {
  "solver-selected": "Solver selected",
  "in-progress": "In progress",
  submitted: "Submitted for review",
  revision: "Revision requested",
  completed: "Completed",
  cancelled: "Cancelled",
  closed: "Closed",
};
const steps = [
  "solver-selected",
  "in-progress",
  "submitted",
  "completed",
] as const;

export function TaskWorkroomPage({ identifier }: { identifier: string }) {
  const router = useRouter();
  const revisionDialog = useRef<HTMLDialogElement>(null);
  const acceptDialog = useRef<HTMLDialogElement>(null);
  const cancelDialog = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<AuthSession | null>();
  const [context, setContext] = useState<WorkroomContext | null>();
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    let refresh: () => void = () => {};
    void readAuthSession().then((current) => {
      if (!active) return;
      if (!current) {
        router.replace(
          `/auth/login?next=${encodeURIComponent(`/dashboard/tasks/work/${identifier}`)}`,
        );
        return;
      }
      setSession(current);
      refresh = () =>
        setContext(getWorkroomContext(identifier, current) ?? null);
      refresh();
      window.addEventListener(taskWorkroomEvent, refresh);
    });
    return () => {
      active = false;
      window.removeEventListener(taskWorkroomEvent, refresh);
    };
  }, [identifier, router]);

  const room = context ? getEffectiveWorkroom(context) : undefined;
  const permissions = context ? workroomPermissions(context) : null;
  const awaiting = room?.submissions.findLast(
    (item) => item.status === "submitted",
  );

  function run(
    action: () => ReturnType<typeof acceptTaskSubmission>,
    dialog: React.RefObject<HTMLDialogElement | null>,
    success: string,
  ) {
    if (busy) return;
    setBusy(true);
    setError("");
    const result = action();
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    dialog.current?.close();
    setNotice(success);
  }

  if (session === undefined || context === undefined)
    return (
      <PublicShell>
        <div
          className="page-container workroom-loading"
          role="status"
          aria-label="Loading task workroom"
        >
          <div />
          <div />
          <div />
        </div>
      </PublicShell>
    );
  if (!context)
    return (
      <WorkroomState
        title="Task not found"
        body="This task does not exist in the current catalogue."
      />
    );
  if (context.role === "unauthorized")
    return (
      <WorkroomState
        title="Workroom unavailable"
        body="Only the task owner and selected solver can view this private execution workspace."
      />
    );
  if (!context.proposal || !context.authored?.selectedProposalId || !room)
    return (
      <WorkroomState
        title="Workroom not active"
        body="This task needs a selected solver before its shared execution workspace becomes available."
        taskId={context.task.id}
        owner={context.role === "owner"}
      />
    );

  const task = context.task;
  return (
    <PublicShell>
      <div className="task-workroom">
        <div className="page-container">
          <TaskDashboardNav />
          <nav className="task-detail__breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link
              href={
                context.role === "owner"
                  ? "/dashboard/tasks/posted"
                  : "/dashboard/tasks/proposals"
              }
            >
              {context.role === "owner" ? "My Posted Tasks" : "My Proposals"}
            </Link>
            <span>/</span>
            <span aria-current="page">Workroom</span>
          </nav>
          <header className="workroom-header">
            <div>
              <p className="section-kicker">
                Task workroom · You are the {context.role}
              </p>
              <h1>{task.title}</h1>
              <Link href={`/tasks/${task.slug}`}>View public task details</Link>
            </div>
            <span className={`workroom-status workroom-status--${room.status}`}>
              {labels[room.status]}
            </span>
          </header>
          <section
            className="workroom-facts"
            aria-label="Workroom participants and deadline"
          >
            <div>
              <span>Task owner</span>
              <strong>{task.owner}</strong>
            </div>
            <div>
              <span>Selected solver</span>
              <strong>{context.proposal.solverName}</strong>
            </div>
            <div>
              <span>Task deadline</span>
              <strong>
                {date.format(new Date(`${task.deadline}T00:00:00`))}
              </strong>
            </div>
            <div>
              <span>Proposed completion</span>
              <strong>
                {date.format(
                  new Date(`${context.proposal.completionDate}T00:00:00`),
                )}
              </strong>
            </div>
          </section>
          {notice && (
            <p className="task-author-notice" role="status">
              {notice}
            </p>
          )}
          <div className="workroom-layout">
            <main className="workroom-main">
              <section className="workroom-panel">
                <p className="section-kicker">Expected deliverable</p>
                <h2>What must be delivered</h2>
                <p>{task.expectedDeliverable}</p>
                <p>
                  <strong>Submission format:</strong>{" "}
                  {task.submissionExpectation}
                </p>
              </section>
              <section className="workroom-panel">
                <p className="section-kicker">Agreed scope</p>
                <h2>Original request and selected approach</h2>
                <h3>Owner requested</h3>
                <p>{task.description}</p>
                <h3>Selected solver proposed</h3>
                <p>{context.proposal.approach}</p>
                <dl className="workroom-agreement">
                  <div>
                    <dt>Agreed compensation</dt>
                    <dd>
                      {money.format(
                        context.proposal.proposedCompensation ?? task.budget,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Relevant experience</dt>
                    <dd>
                      {context.proposal.experience ||
                        "No additional experience was included."}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="workroom-panel">
                <p className="section-kicker">Task requirements</p>
                <h2>Requirements and constraints</h2>
                <ul>
                  {task.requirements.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
                {context.authored?.capability && (
                  <p>
                    <strong>Capability requested:</strong>{" "}
                    {context.authored.capability}
                  </p>
                )}
              </section>
              <SubmissionHistory room={room} />
              <RevisionHistory room={room} />
              <TaskActivityTimeline room={room} />
            </main>
            <aside className="workroom-side">
              <section className="workroom-panel">
                <p className="section-kicker">Work progress</p>
                <h2>{labels[room.status]}</h2>
                <ol className="workroom-steps">
                  {steps.map((step, index) => {
                    const current =
                      room.status === step ||
                      (room.status === "revision" && step === "submitted");
                    const completed =
                      room.status === "completed" ||
                      steps.indexOf(room.status as (typeof steps)[number]) >
                        index;
                    return (
                      <li
                        key={step}
                        className={
                          current
                            ? "is-current"
                            : completed
                              ? "is-complete"
                              : ""
                        }
                      >
                        <span>
                          {completed
                            ? "Complete"
                            : current
                              ? "Current"
                              : "Next"}
                        </span>
                        {labels[step]}
                      </li>
                    );
                  })}
                </ol>
                {room.status === "revision" && (
                  <p className="workroom-callout">
                    Revision is required before a new submission can be
                    reviewed.
                  </p>
                )}
                {permissions?.readOnly && (
                  <p className="workroom-callout">
                    This workroom is read-only. Its execution history remains
                    available.
                  </p>
                )}
                <Link
                  className="workroom-history-link"
                  href={`/dashboard/tasks/work/${task.id}/history`}
                >
                  View Full History
                </Link>
              </section>
              {(permissions?.canSubmitWork ||
                permissions?.canRequestRevision ||
                permissions?.canAcceptSubmission ||
                permissions?.canCancel) && (
                <section className="workroom-panel workroom-actions">
                  <p className="section-kicker">Your next action</p>
                  {permissions.canSubmitWork && (
                    <>
                      <Link
                        className="button button--primary"
                        href={`/dashboard/tasks/work/${task.id}/submit`}
                      >
                        {room.status === "revision"
                          ? "Submit Revised Work"
                          : "Submit Work"}
                      </Link>
                      <p>Submit the completed deliverable for owner review.</p>
                    </>
                  )}
                  {permissions.canRequestRevision && awaiting && (
                    <button
                      className="button button--secondary"
                      type="button"
                      onClick={() => {
                        setError("");
                        revisionDialog.current?.showModal();
                      }}
                    >
                      Request Revision
                    </button>
                  )}
                  {permissions.canAcceptSubmission && awaiting && (
                    <button
                      className="button button--accent"
                      type="button"
                      onClick={() => {
                        setError("");
                        acceptDialog.current?.showModal();
                      }}
                    >
                      Accept Submission
                    </button>
                  )}
                  {permissions.canCancel && (
                    <button
                      className="button button--danger"
                      type="button"
                      onClick={() => {
                        setError("");
                        cancelDialog.current?.showModal();
                      }}
                    >
                      Cancel Task
                    </button>
                  )}
                </section>
              )}
            </aside>
          </div>
          <dialog
            ref={revisionDialog}
            className="task-confirm-dialog workroom-dialog"
            onClose={() => {
              setError("");
              setInstructions("");
            }}
          >
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (session && awaiting)
                  run(
                    () =>
                      requestTaskRevision(
                        task.id,
                        awaiting.id,
                        instructions,
                        session,
                      ),
                    revisionDialog,
                    "Revision requested. The solver can now prepare a revised submission.",
                  );
              }}
            >
              <h2>Request a revision</h2>
              <p>
                Submission {awaiting?.version} will remain in history and the
                solver will need to revise and resubmit.
              </p>
              <label htmlFor="revision-instructions">
                What needs to change?
              </label>
              <textarea
                id="revision-instructions"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
                minLength={10}
                required
                rows={5}
                autoFocus
              />
              {error && (
                <p className="field-error" role="alert">
                  {error}
                </p>
              )}
              <div>
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => revisionDialog.current?.close()}
                >
                  Keep submission
                </button>
                <button
                  className="button button--primary"
                  type="submit"
                  disabled={busy}
                >
                  Confirm Revision Request
                </button>
              </div>
            </form>
          </dialog>
          <dialog
            ref={acceptDialog}
            className="task-confirm-dialog"
            onClose={() => setError("")}
          >
            <h2>Accept this submission?</h2>
            <p>
              This confirms the deliverable meets the agreed scope and completes
              the task. No payment is processed.
            </p>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <div>
              <button
                className="button button--secondary"
                type="button"
                disabled={busy}
                onClick={() => acceptDialog.current?.close()}
              >
                Continue review
              </button>
              <button
                className="button button--accent"
                type="button"
                disabled={busy}
                onClick={() =>
                  session &&
                  awaiting &&
                  run(
                    () => acceptTaskSubmission(task.id, awaiting.id, session),
                    acceptDialog,
                    "Submission accepted. The task is complete.",
                  )
                }
              >
                Accept and Complete
              </button>
            </div>
          </dialog>
          <dialog
            ref={cancelDialog}
            className="task-confirm-dialog"
            onClose={() => setError("")}
          >
            <h2>Cancel this task?</h2>
            <p>
              Active work will stop. The agreement and history will remain
              visible as a read-only record.
            </p>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <div>
              <button
                className="button button--secondary"
                type="button"
                disabled={busy}
                onClick={() => cancelDialog.current?.close()}
              >
                Keep task active
              </button>
              <button
                className="button button--danger"
                type="button"
                disabled={busy}
                onClick={() =>
                  session &&
                  run(
                    () => cancelTaskWork(task.id, session),
                    cancelDialog,
                    "Task cancelled. Workroom history remains available.",
                  )
                }
              >
                Confirm Cancellation
              </button>
            </div>
          </dialog>
        </div>
      </div>
    </PublicShell>
  );
}

function WorkroomState({
  title,
  body,
  taskId,
  owner,
}: {
  title: string;
  body: string;
  taskId?: string;
  owner?: boolean;
}) {
  return (
    <PublicShell>
      <div className="page-container task-detail-missing">
        <p className="section-kicker">Task workroom</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="proposal-state-actions">
          <Link
            className="button button--primary"
            href={owner ? "/dashboard/tasks/posted" : "/dashboard"}
          >
            Return to dashboard
          </Link>
          {owner && taskId && (
            <Link
              className="button button--secondary"
              href={`/dashboard/tasks/posted/${taskId}/proposals`}
            >
              Review Proposals
            </Link>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
