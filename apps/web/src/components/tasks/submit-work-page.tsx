"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import {
  getEffectiveWorkroom,
  getWorkroomContext,
  submitTaskDeliverable,
  type WorkroomContext,
} from "@/services/task-workroom";

const date = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const dateTime = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
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
type Errors = Partial<Record<"message" | "description" | "links", string>>;

export function SubmitWorkPage({ identifier }: { identifier: string }) {
  const router = useRouter();
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<AuthSession | null>();
  const [context, setContext] = useState<WorkroomContext | null>();
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [links, setLinks] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [serviceError, setServiceError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void readAuthSession().then((current) => {
      if (!active) return;
      if (!current) {
        router.replace(
          `/auth/login?next=${encodeURIComponent(`/dashboard/tasks/work/${identifier}/submit`)}`,
        );
        return;
      }
      setSession(current);
      setContext(getWorkroomContext(identifier, current) ?? null);
    });
    return () => {
      active = false;
    };
  }, [identifier, router]);

  if (session === undefined || context === undefined)
    return (
      <PublicShell>
        <div
          className="page-container submission-loading"
          role="status"
          aria-label="Loading submission form"
        >
          <div />
          <div />
        </div>
      </PublicShell>
    );
  if (!context)
    return (
      <SubmitState
        title="Task not found"
        body="This task does not exist in the current catalogue."
      />
    );
  if (context.role !== "solver")
    return (
      <SubmitState
        title="Submission unavailable"
        body="Only the selected solver can submit work for this task."
        taskId={context.task.id}
      />
    );
  const room = getEffectiveWorkroom(context);
  if (!room)
    return (
      <SubmitState
        title="Submission unavailable"
        body="This task does not have an active selected-solver workroom."
        taskId={context.task.id}
      />
    );
  const eligible = ["solver-selected", "in-progress", "revision"].includes(
    room.status,
  );
  if (!eligible)
    return (
      <SubmitState
        title={
          room.status === "submitted"
            ? "Submission received"
            : labels[room.status]
        }
        body={
          room.status === "submitted"
            ? "Your latest submission is awaiting the task owner's review."
            : "This task no longer accepts work submissions."
        }
        taskId={context.task.id}
        history
      />
    );
  const revision =
    room.status === "revision"
      ? [...room.revisions].reverse().find((item) => !item.resolvedAt)
      : undefined;
  const taskId = context.task.id;

  function validate() {
    const next: Errors = {};
    if (message.trim().length < 20)
      next.message =
        "Write at least 20 characters explaining what you are submitting.";
    if (description.trim().length < 20)
      next.description =
        "Describe the delivered output in at least 20 characters.";
    const values = links
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
    if (values.length > 5) next.links = "Provide no more than five links.";
    else if (
      values.some((item) => {
        try {
          return new URL(item).protocol !== "https:";
        } catch {
          return true;
        }
      })
    )
      next.links = "Each link must be a complete HTTPS URL, one per line.";
    setErrors(next);
    if (Object.keys(next).length) {
      document.getElementById(`submission-${Object.keys(next)[0]}`)?.focus();
      return false;
    }
    return true;
  }

  function requestSubmit(event: React.FormEvent) {
    event.preventDefault();
    setServiceError("");
    if (validate()) confirmDialog.current?.showModal();
  }
  function confirmSubmit() {
    if (!session || busy) return;
    setBusy(true);
    setServiceError("");
    const result = submitTaskDeliverable(
      taskId,
      {
        message,
        deliverableDescription: description,
        links: links
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
        completionNotes: notes,
      },
      session,
    );
    if (!result.ok) {
      setBusy(false);
      setServiceError(result.message);
      return;
    }
    router.push(`/dashboard/tasks/work/${taskId}?submitted=1`);
  }

  return (
    <PublicShell>
      <div className="task-submission">
        <div className="page-container">
          <nav className="task-detail__breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard/tasks/proposals">My Proposals</Link>
            <span>/</span>
            <Link href={`/dashboard/tasks/work/${context.task.id}`}>
              Workroom
            </Link>
            <span>/</span>
            <span aria-current="page">Submit Work</span>
          </nav>
          <header className="submission-header">
            <div>
              <p className="section-kicker">
                {revision ? "Revision resubmission" : "Work submission"}
              </p>
              <h1>Submit deliverable</h1>
              <p>{context.task.title}</p>
            </div>
            <span className={`workroom-status workroom-status--${room.status}`}>
              {labels[room.status]}
            </span>
          </header>
          {revision && (
            <section
              className="revision-context"
              aria-labelledby="revision-title"
            >
              <p className="section-kicker">Owner revision request</p>
              <h2 id="revision-title">Changes required before resubmission</h2>
              <p>{revision.instructions}</p>
              <p>
                Requested{" "}
                <time dateTime={revision.requestedAt}>
                  {dateTime.format(new Date(revision.requestedAt))}
                </time>{" "}
                for Submission{" "}
                {room.submissions.find(
                  (item) => item.id === revision.submissionId,
                )?.version ?? "unavailable"}
                .
              </p>
            </section>
          )}
          <div className="submission-layout">
            <main>
              <form
                className="submission-form"
                noValidate
                onSubmit={requestSubmit}
              >
                <div>
                  <label htmlFor="submission-message">Submission message</label>
                  <p id="submission-message-help">
                    Explain what is complete and what the owner should review.
                  </p>
                  <textarea
                    id="submission-message"
                    aria-describedby={`submission-message-help${errors.message ? " submission-message-error" : ""}`}
                    aria-invalid={Boolean(errors.message)}
                    rows={5}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                  {errors.message && (
                    <p
                      id="submission-message-error"
                      className="field-error"
                      role="alert"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="submission-description">
                    Deliverable description
                  </label>
                  <p id="submission-description-help">
                    Describe the actual output, files, document, code, analysis,
                    or result delivered.
                  </p>
                  <textarea
                    id="submission-description"
                    aria-describedby={`submission-description-help${errors.description ? " submission-description-error" : ""}`}
                    aria-invalid={Boolean(errors.description)}
                    rows={6}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                  {errors.description && (
                    <p
                      id="submission-description-error"
                      className="field-error"
                      role="alert"
                    >
                      {errors.description}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="submission-links">
                    Relevant HTTPS links <span>(optional)</span>
                  </label>
                  <p id="submission-links-help">
                    One complete HTTPS URL per line, up to five. Links are
                    stored as references and are not embedded.
                  </p>
                  <textarea
                    id="submission-links"
                    aria-describedby={`submission-links-help${errors.links ? " submission-links-error" : ""}`}
                    aria-invalid={Boolean(errors.links)}
                    rows={4}
                    value={links}
                    onChange={(event) => setLinks(event.target.value)}
                  />
                  {errors.links && (
                    <p
                      id="submission-links-error"
                      className="field-error"
                      role="alert"
                    >
                      {errors.links}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="submission-notes">
                    Completion notes <span>(optional)</span>
                  </label>
                  <p id="submission-notes-help">
                    Add usage instructions, limitations, or final remarks
                    without repeating the submission message.
                  </p>
                  <textarea
                    id="submission-notes"
                    aria-describedby="submission-notes-help"
                    rows={4}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </div>
                <div className="attachment-boundary">
                  <strong>File attachments are unavailable</strong>
                  <p>
                    The current frontend has no secure object storage. Add a
                    permitted HTTPS link or describe the deliverable instead.
                  </p>
                </div>
                <div className="submission-form-actions">
                  <button className="button button--primary" type="submit">
                    Submit Deliverable
                  </button>
                  <Link
                    className="button button--secondary"
                    href={`/dashboard/tasks/work/${context.task.id}`}
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </main>
            <aside className="submission-context">
              <section>
                <p className="section-kicker">Task context</p>
                <h2>Expected deliverable</h2>
                <p>{context.task.expectedDeliverable}</p>
                <dl>
                  <div>
                    <dt>Owner</dt>
                    <dd>{context.task.owner}</dd>
                  </div>
                  <div>
                    <dt>Deadline</dt>
                    <dd>
                      {date.format(
                        new Date(`${context.task.deadline}T00:00:00`),
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Submission number</dt>
                    <dd>{room.submissions.length + 1}</dd>
                  </div>
                </dl>
              </section>
              <Link href={`/dashboard/tasks/work/${context.task.id}/history`}>
                View task history
              </Link>
            </aside>
          </div>
          <dialog
            ref={confirmDialog}
            className="task-confirm-dialog"
            onClose={() => setServiceError("")}
          >
            <h2>Submit this deliverable?</h2>
            <p>
              The task will move to Submitted for owner review. The owner may
              accept it or request another revision.
            </p>
            {serviceError && (
              <p className="field-error" role="alert">
                {serviceError}
              </p>
            )}
            <div>
              <button
                className="button button--secondary"
                type="button"
                disabled={busy}
                onClick={() => confirmDialog.current?.close()}
              >
                Review submission
              </button>
              <button
                className="button button--primary"
                type="button"
                disabled={busy}
                onClick={confirmSubmit}
              >
                {busy ? "Submitting…" : "Confirm Submission"}
              </button>
            </div>
          </dialog>
        </div>
      </div>
    </PublicShell>
  );
}

function SubmitState({
  title,
  body,
  taskId,
  history,
}: {
  title: string;
  body: string;
  taskId?: string;
  history?: boolean;
}) {
  return (
    <PublicShell>
      <div className="page-container task-detail-missing">
        <p className="section-kicker">Submit work</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <div className="proposal-state-actions">
          <Link
            className="button button--primary"
            href={
              taskId
                ? `/dashboard/tasks/work/${taskId}`
                : "/dashboard/tasks/proposals"
            }
          >
            {taskId ? "Return to Workroom" : "My Proposals"}
          </Link>
          {history && taskId && (
            <Link
              className="button button--secondary"
              href={`/dashboard/tasks/work/${taskId}/history`}
            >
              View Task History
            </Link>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
