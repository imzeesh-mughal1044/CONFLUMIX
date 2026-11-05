"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import {
  closeAuthoredTask,
  findAuthoredTask,
  taskAuthoringEvent,
} from "@/services/task-authoring";
import {
  getProposalsForTask,
  getTasksByOwner,
  taskProposalEvent,
} from "@/services/task-proposals";
import type { AuthoredTask, TaskDetail } from "@/types/tasks";
import { TaskDashboardNav } from "./task-dashboard-nav";

type ManagedTask = TaskDetail | AuthoredTask;
type SummaryKey =
  | "all"
  | "draft"
  | "published"
  | "receiving"
  | "reviewing"
  | "in-progress"
  | "completed"
  | "closed";
const summaries: Array<[SummaryKey, string]> = [
  ["draft", "Draft"],
  ["published", "Published"],
  ["receiving", "Receiving proposals"],
  ["reviewing", "Under review"],
  ["in-progress", "In progress"],
  ["completed", "Completed"],
  ["closed", "Closed / expired"],
];
const dateFormat = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function taskMatches(task: ManagedTask, filter: SummaryKey) {
  const proposals = getProposalsForTask(task.id).length;
  if (filter === "all") return true;
  if (filter === "draft") return task.status === "draft";
  if (filter === "published") return task.status === "open";
  if (filter === "receiving") return task.status === "open" && proposals > 0;
  if (filter === "reviewing") return task.status === "reviewing";
  if (filter === "in-progress")
    return task.status === "in-progress" || task.status === "solver-selected";
  if (filter === "completed") return false;
  return task.status === "closed" || task.status === "expired";
}

export function PostedTasksPage() {
  const router = useRouter();
  const closeDialog = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<AuthSession | null>();
  const [tasks, setTasks] = useState<ManagedTask[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<SummaryKey>("all");
  const [closing, setClosing] = useState<ManagedTask | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let refresh: () => void = () => {};
    void readAuthSession().then((current) => {
      if (!active) return;
      if (!current) {
        router.replace("/auth/login?next=%2Fdashboard%2Ftasks%2Fposted");
        return;
      }
      setSession(current);
      refresh = () =>
        setTasks(getTasksByOwner(current.email, current.fullName));
      refresh();
      setReady(true);
      window.addEventListener(taskAuthoringEvent, refresh);
      window.addEventListener(taskProposalEvent, refresh);
    });
    return () => {
      active = false;
      window.removeEventListener(taskAuthoringEvent, refresh);
      window.removeEventListener(taskProposalEvent, refresh);
    };
  }, [router]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        summaries.map(([key]) => [
          key,
          tasks.filter((task) => taskMatches(task, key)).length,
        ]),
      ),
    [tasks],
  );
  const visible = tasks.filter((task) => taskMatches(task, filter));

  function requestClose(task: ManagedTask) {
    setError("");
    setClosing(task);
    closeDialog.current?.showModal();
  }

  function confirmClose() {
    if (!closing || !session) return;
    if (!closeAuthoredTask(closing.id, session.email)) {
      setError(
        "This browser can close only an authored task owned by your signed-in account.",
      );
      return;
    }
    closeDialog.current?.close();
    setClosing(null);
  }

  if (!ready)
    return (
      <PublicShell>
        <div className="page-container task-dashboard-loading" role="status">
          <div />
          <div />
          <div />
        </div>
      </PublicShell>
    );

  return (
    <PublicShell>
      <div className="task-dashboard">
        <div className="page-container">
          <TaskDashboardNav />
          <header className="task-dashboard__header">
            <div>
              <p className="section-kicker">Personal dashboard</p>
              <h1>My Posted Tasks</h1>
              <p>
                Manage tasks you own and see proposal activity from actual
                records.
              </p>
            </div>
            <Link className="button button--primary" href="/tasks/new">
              Post New Task
            </Link>
          </header>
          {tasks.length === 0 ? (
            <div className="task-dashboard-empty">
              <h2>You haven&apos;t posted any tasks yet.</h2>
              <p>Post a focused problem and describe the outcome you need.</p>
              <Link className="button button--primary" href="/tasks/new">
                Post New Task
              </Link>
            </div>
          ) : (
            <>
              <section
                className="task-summary-strip"
                aria-label="Filter tasks by lifecycle"
              >
                <button
                  type="button"
                  className={filter === "all" ? "is-active" : ""}
                  aria-pressed={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  <span>All</span>
                  <strong>{tasks.length}</strong>
                </button>
                {summaries.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={filter === key ? "is-active" : ""}
                    aria-pressed={filter === key}
                    onClick={() => setFilter(key)}
                  >
                    <span>{label}</span>
                    <strong>{counts[key]}</strong>
                  </button>
                ))}
              </section>
              {visible.length === 0 ? (
                <div className="task-dashboard-empty task-dashboard-empty--compact">
                  <h2>No tasks in this status</h2>
                  <p>Choose All to return to every task you own.</p>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => setFilter("all")}
                  >
                    Show all tasks
                  </button>
                </div>
              ) : (
                <div
                  className="task-management-list"
                  role="region"
                  aria-label="Posted tasks"
                  tabIndex={0}
                >
                  <table>
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Published</th>
                        <th>Deadline</th>
                        <th>Status</th>
                        <th>Proposals</th>
                        <th>Selected solver</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onClose={requestClose}
                        />
                      ))}
                    </tbody>
                  </table>
                  <div className="task-management-cards">
                    {visible.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClose={requestClose}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          <dialog
            ref={closeDialog}
            className="task-confirm-dialog"
            onClose={() => setClosing(null)}
          >
            <h2>Close this task?</h2>
            <p>
              Closing stops new proposals. Existing proposal records remain
              available.
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
                onClick={() => closeDialog.current?.close()}
              >
                Cancel
              </button>
              <button
                className="button button--danger"
                type="button"
                onClick={confirmClose}
              >
                Confirm closure
              </button>
            </div>
          </dialog>
        </div>
      </div>
    </PublicShell>
  );
}

function displayStatus(task: ManagedTask, count: number) {
  if (task.status === "draft") return "Draft";
  if (task.status === "open" && count > 0) return "Receiving proposals";
  if (task.status === "open") return "Published";
  if (task.status === "reviewing") return "Under review";
  if (task.status === "solver-selected") return "Solver selected";
  if (task.status === "in-progress") return "In progress";
  if (task.status === "submitted") return "Submitted";
  if (task.status === "revision") return "Revision requested";
  if (task.status === "completed") return "Completed";
  if (task.status === "cancelled") return "Cancelled";
  return task.status === "expired" ? "Expired" : "Closed";
}

function taskData(task: ManagedTask) {
  const proposals = getProposalsForTask(task.id);
  const accepted = proposals.find((proposal) => proposal.status === "accepted");
  return { proposals, accepted, status: displayStatus(task, proposals.length) };
}

function TaskActions({
  task,
  onClose,
}: {
  task: ManagedTask;
  onClose: (task: ManagedTask) => void;
}) {
  const { proposals, accepted } = taskData(task);
  const isLocal = Boolean(findAuthoredTask(task.id));
  return (
    <div className="task-row-actions">
      {task.status !== "draft" && (
        <Link href={`/tasks/${task.slug}`}>View Task</Link>
      )}
      {task.status === "open" && (
        <Link href={`/tasks/${task.slug}/edit`}>Edit</Link>
      )}
      {proposals.length > 0 && task.status !== "draft" && (
        <Link href={`/dashboard/tasks/posted/${task.id}/proposals`}>
          Review Proposals
        </Link>
      )}
      {task.status === "open" && isLocal && (
        <button type="button" onClick={() => onClose(task)}>
          Close
        </button>
      )}
      {accepted &&
        [
          "solver-selected",
          "in-progress",
          "submitted",
          "revision",
          "completed",
          "cancelled",
          "closed",
        ].includes(task.status) && (
          <Link href={`/dashboard/tasks/work/${task.id}`}>
            View Work Progress
          </Link>
        )}
    </div>
  );
}

function TaskRow({
  task,
  onClose,
}: {
  task: ManagedTask;
  onClose: (task: ManagedTask) => void;
}) {
  const { proposals, accepted, status } = taskData(task);
  return (
    <tr>
      <th scope="row">
        <span>{task.title}</span>
      </th>
      <td>
        {task.status === "draft"
          ? "Not published"
          : dateFormat.format(new Date(task.createdAt))}
      </td>
      <td>{dateFormat.format(new Date(`${task.deadline}T00:00:00`))}</td>
      <td>
        <span className="task-management-status">{status}</span>
      </td>
      <td>{proposals.length}</td>
      <td>{accepted ? accepted.solverName : "Not selected"}</td>
      <td>
        <TaskActions task={task} onClose={onClose} />
      </td>
    </tr>
  );
}

function TaskCard({
  task,
  onClose,
}: {
  task: ManagedTask;
  onClose: (task: ManagedTask) => void;
}) {
  const { proposals, accepted, status } = taskData(task);
  return (
    <article>
      <div>
        <span className="task-management-status">{status}</span>
        <h2>{task.title}</h2>
      </div>
      <dl>
        <div>
          <dt>Deadline</dt>
          <dd>{dateFormat.format(new Date(`${task.deadline}T00:00:00`))}</dd>
        </div>
        <div>
          <dt>Proposals</dt>
          <dd>{proposals.length}</dd>
        </div>
        <div>
          <dt>Selected solver</dt>
          <dd>{accepted ? accepted.solverName : "Not selected"}</dd>
        </div>
      </dl>
      <TaskActions task={task} onClose={onClose} />
    </article>
  );
}
