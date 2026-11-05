"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession } from "@/lib/auth";
import {
  getEffectiveWorkroom,
  getWorkroomContext,
  type WorkroomContext,
} from "@/services/task-workroom";
import type { WorkSubmission } from "@/types/tasks";
import {
  RevisionHistory,
  SubmissionDetailContent,
  SubmissionHistory,
  TaskActivityTimeline,
} from "./task-execution-history";

const date = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
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

export function TaskHistoryPage({ identifier }: { identifier: string }) {
  const router = useRouter();
  const detailDialog = useRef<HTMLDialogElement>(null);
  const [context, setContext] = useState<WorkroomContext | null>();
  const [selected, setSelected] = useState<WorkSubmission | null>(null);
  useEffect(() => {
    let active = true;
    void readAuthSession().then((session) => {
      if (!active) return;
      if (!session) {
        router.replace(
          `/auth/login?next=${encodeURIComponent(`/dashboard/tasks/work/${identifier}/history`)}`,
        );
        return;
      }
      setContext(getWorkroomContext(identifier, session) ?? null);
    });
    return () => {
      active = false;
    };
  }, [identifier, router]);
  if (context === undefined)
    return (
      <PublicShell>
        <div
          className="page-container history-loading"
          role="status"
          aria-label="Loading task history"
        >
          <div />
          <div />
          <div />
        </div>
      </PublicShell>
    );
  if (!context)
    return (
      <HistoryState
        title="Task not found"
        body="This task does not exist in the current catalogue."
      />
    );
  if (context.role === "unauthorized")
    return (
      <HistoryState
        title="History unavailable"
        body="Only the task owner and selected solver can view this private execution history."
      />
    );
  const room = getEffectiveWorkroom(context);
  if (!room || !context.proposal)
    return (
      <HistoryState
        title="History not available"
        body="Execution history becomes available after a solver is selected."
        taskId={context.task.id}
      />
    );
  const roleForActor = (actor: string) =>
    actor === context.task.owner
      ? "Task Owner"
      : actor === context.proposal?.solverName
        ? "Selected Solver"
        : "Actor role unavailable";
  return (
    <PublicShell>
      <div className="task-history">
        <div className="page-container">
          <nav className="task-detail__breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link href={`/dashboard/tasks/work/${context.task.id}`}>
              Workroom
            </Link>
            <span>/</span>
            <span aria-current="page">History</span>
          </nav>
          <header className="history-header">
            <div>
              <p className="section-kicker">Task lifecycle and history</p>
              <h1>{context.task.title}</h1>
              <p>
                Oldest recorded execution event first. Only events actually
                stored for this task are shown.
              </p>
            </div>
            <span className={`workroom-status workroom-status--${room.status}`}>
              {labels[room.status]}
            </span>
          </header>
          <section
            className="history-summary"
            aria-label="Task history summary"
          >
            <div>
              <span>Task owner</span>
              <strong>{context.task.owner}</strong>
            </div>
            <div>
              <span>Selected solver</span>
              <strong>{context.proposal.solverName}</strong>
            </div>
            <div>
              <span>Deadline</span>
              <strong>
                {date.format(new Date(`${context.task.deadline}T00:00:00`))}
              </strong>
            </div>
          </section>
          <div className="history-actions">
            <Link
              className="button button--primary"
              href={`/dashboard/tasks/work/${context.task.id}`}
            >
              Return to Workroom
            </Link>
            <Link
              className="button button--secondary"
              href={`/tasks/${context.task.slug}`}
            >
              View Task Details
            </Link>
          </div>
          <main className="history-layout">
            <TaskActivityTimeline room={room} roleForActor={roleForActor} />
            <SubmissionHistory
              room={room}
              onView={(submission) => {
                setSelected(submission);
                requestAnimationFrame(() => detailDialog.current?.showModal());
              }}
            />
            <RevisionHistory room={room} />
          </main>
          <dialog
            ref={detailDialog}
            className="submission-detail-dialog"
            onClose={() => setSelected(null)}
          >
            {selected && (
              <SubmissionDetailContent
                submission={selected}
                room={room}
                close={() => detailDialog.current?.close()}
              />
            )}
          </dialog>
        </div>
      </div>
    </PublicShell>
  );
}

function HistoryState({
  title,
  body,
  taskId,
}: {
  title: string;
  body: string;
  taskId?: string;
}) {
  return (
    <PublicShell>
      <div className="page-container task-detail-missing">
        <p className="section-kicker">Task history</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <Link
          className="button button--primary"
          href={taskId ? `/dashboard/tasks/work/${taskId}` : "/dashboard"}
        >
          {taskId ? "Return to Workroom" : "Return to Dashboard"}
        </Link>
      </div>
    </PublicShell>
  );
}
