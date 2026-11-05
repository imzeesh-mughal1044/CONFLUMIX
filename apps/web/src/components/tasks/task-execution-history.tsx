"use client";

import type { TaskWorkroom, WorkSubmission } from "@/types/tasks";

const dateTime = new Intl.DateTimeFormat("en-PK", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function SubmissionDetailContent({
  submission,
  room,
  close,
}: {
  submission: WorkSubmission;
  room: TaskWorkroom;
  close?: () => void;
}) {
  const revision = room.revisions.find(
    (item) =>
      item.id === submission.relatedRevisionId ||
      item.submissionId === submission.id,
  );
  const message =
    submission.message ??
    submission.note ??
    "Submission message was not recorded in this legacy entry.";
  const description =
    submission.deliverableDescription ??
    submission.note ??
    "Deliverable description was not recorded in this legacy entry.";
  const links = submission.links ?? submission.references ?? [];
  return (
    <div className="submission-detail-content">
      <header>
        <div>
          <p className="section-kicker">Submission {submission.version}</p>
          <h2>Submitted deliverable</h2>
        </div>
        {close && (
          <button
            type="button"
            onClick={close}
            aria-label={`Close Submission ${submission.version} details`}
          >
            ×
          </button>
        )}
      </header>
      <dl>
        <div>
          <dt>Status</dt>
          <dd>{submission.status.replace("-", " ")}</dd>
        </div>
        <div>
          <dt>Submitted</dt>
          <dd>
            <time dateTime={submission.submittedAt}>
              {dateTime.format(new Date(submission.submittedAt))}
            </time>
          </dd>
        </div>
      </dl>
      <section>
        <h3>Submission message</h3>
        <p>{message}</p>
      </section>
      <section>
        <h3>Deliverable description</h3>
        <p>{description}</p>
      </section>
      <section>
        <h3>Completion notes</h3>
        <p>
          {submission.completionNotes ||
            "No additional completion notes were provided."}
        </p>
      </section>
      {links.length > 0 && (
        <section>
          <h3>Relevant links</h3>
          <ul>
            {links.map((link) => (
              <li key={link}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      {revision && (
        <section>
          <h3>Related revision</h3>
          <p>{revision.instructions}</p>
          <p>
            {revision.resolvedAt
              ? `Resolved ${dateTime.format(new Date(revision.resolvedAt))}`
              : "Revision remains open."}
          </p>
        </section>
      )}
      <p className="workroom-callout">
        No file attachments are stored by the current frontend prototype.
      </p>
    </div>
  );
}

export function SubmissionHistory({
  room,
  onView,
}: {
  room: TaskWorkroom;
  onView?: (submission: WorkSubmission) => void;
}) {
  const items = [...room.submissions].sort((a, b) =>
    a.submittedAt.localeCompare(b.submittedAt),
  );
  return (
    <section className="workroom-panel">
      <p className="section-kicker">Submission history</p>
      <h2>Submitted work</h2>
      {items.length === 0 ? (
        <p className="workroom-empty">No work has been submitted yet.</p>
      ) : (
        <ol className="workroom-history">
          {items.map((item) => (
            <li key={item.id}>
              <div>
                <h3>Submission {item.version}</h3>
                <span>{item.status.replace("-", " ")}</span>
              </div>
              <time dateTime={item.submittedAt}>
                {dateTime.format(new Date(item.submittedAt))}
              </time>
              <p>
                {item.message ?? item.note ?? "Submission details unavailable."}
              </p>
              {onView && (
                <button
                  className="button button--secondary"
                  type="button"
                  aria-label={`View Submission ${item.version}`}
                  onClick={() => onView(item)}
                >
                  View Submission
                </button>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function RevisionHistory({ room }: { room: TaskWorkroom }) {
  const items = [...room.revisions].sort((a, b) =>
    a.requestedAt.localeCompare(b.requestedAt),
  );
  return (
    <section className="workroom-panel">
      <p className="section-kicker">Revision requests</p>
      <h2>Requested changes</h2>
      {items.length === 0 ? (
        <p className="workroom-empty">No revisions have been requested.</p>
      ) : (
        <ol className="workroom-history">
          {items.map((item) => {
            const submission = room.submissions.find(
              (entry) => entry.id === item.submissionId,
            );
            return (
              <li key={item.id}>
                <div>
                  <h3>
                    Revision for Submission{" "}
                    {submission?.version ?? "unavailable"}
                  </h3>
                  <span>{item.resolvedAt ? "Resolved" : "Open"}</span>
                </div>
                <time dateTime={item.requestedAt}>
                  {dateTime.format(new Date(item.requestedAt))}
                </time>
                <p>{item.instructions}</p>
                {item.resolvedAt && (
                  <p>
                    Resolved by a revised submission on{" "}
                    {dateTime.format(new Date(item.resolvedAt))}.
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function TaskActivityTimeline({
  room,
  roleForActor,
}: {
  room: TaskWorkroom;
  roleForActor?: (actor: string) => string;
}) {
  const items = [...room.activity].sort((a, b) =>
    a.occurredAt.localeCompare(b.occurredAt),
  );
  return (
    <section className="workroom-panel">
      <p className="section-kicker">Activity</p>
      <h2>Task timeline</h2>
      {items.length === 0 ? (
        <p className="workroom-empty">
          No execution events have been recorded.
        </p>
      ) : (
        <ol className="workroom-activity">
          {items.map((item) => (
            <li key={item.id}>
              <span aria-hidden="true" />
              <div>
                <strong>{item.detail}</strong>
                <p>
                  {item.actorName}
                  {roleForActor
                    ? ` — ${roleForActor(item.actorName)}`
                    : ""} ·{" "}
                  <time dateTime={item.occurredAt}>
                    {dateTime.format(new Date(item.occurredAt))}
                  </time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
