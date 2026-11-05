"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import { taskAuthoringEvent } from "@/services/task-authoring";
import {
  getProposalsForTask,
  getTasksByOwner,
  rejectProposal,
  selectSolver,
  taskProposalEvent,
} from "@/services/task-proposals";
import { findTask } from "@/services/tasks";
import type { ProposalStatus, TaskDetail, TaskProposal } from "@/types/tasks";
import { ProposalDetailContent } from "./proposal-detail-content";
import { ProposalStatusBadge } from "./proposal-status-badge";
import { TaskDashboardNav } from "./task-dashboard-nav";

type Filter = "all" | Exclude<ProposalStatus, "draft" | "completed">;
const filters: Array<[Filter, string]> = [
  ["all", "All"],
  ["pending", "Pending"],
  ["accepted", "Selected"],
  ["rejected", "Rejected"],
  ["withdrawn", "Withdrawn"],
];
const dateFormat = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});
const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const taskLabels: Record<TaskDetail["status"], string> = {
  open: "Receiving proposals",
  reviewing: "Under review",
  "solver-selected": "Solver selected",
  "in-progress": "In progress",
  submitted: "Submitted",
  revision: "Revision requested",
  completed: "Completed",
  cancelled: "Cancelled",
  closed: "Closed",
  expired: "Expired",
};

export function ProposalReviewPage({ identifier }: { identifier: string }) {
  const router = useRouter();
  const selectDialog = useRef<HTMLDialogElement>(null);
  const rejectDialog = useRef<HTMLDialogElement>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<AuthSession | null>();
  const [task, setTask] = useState<TaskDetail | null>();
  const [proposals, setProposals] = useState<TaskProposal[]>([]);
  const [authorized, setAuthorized] = useState<boolean>();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<TaskProposal | null>(null);
  const [rejecting, setRejecting] = useState<TaskProposal | null>(null);
  const [detail, setDetail] = useState<TaskProposal | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let refresh = () => {};
    void readAuthSession().then((current) => {
      if (!active) return;
      if (!current) {
        router.replace(
          `/auth/login?next=${encodeURIComponent(`/dashboard/tasks/posted/${identifier}/proposals`)}`,
        );
        return;
      }
      setSession(current);
      refresh = () => {
        const found = findTask(identifier) ?? null;
        setTask(found);
        const owns = Boolean(
          found &&
            getTasksByOwner(current.email, current.fullName).some(
              (item) => item.id === found.id,
            ),
        );
        setAuthorized(owns);
        setProposals(owns && found ? getProposalsForTask(found.id) : []);
      };
      refresh();
      window.addEventListener(taskProposalEvent, refresh);
      window.addEventListener(taskAuthoringEvent, refresh);
    });
    return () => {
      active = false;
      window.removeEventListener(taskProposalEvent, refresh);
      window.removeEventListener(taskAuthoringEvent, refresh);
    };
  }, [identifier, router]);

  const visible = proposals.filter(
    (proposal) => filter === "all" || proposal.status === filter,
  );
  const accepted = proposals.find((proposal) => proposal.status === "accepted");
  const pending = proposals.filter(
    (proposal) => proposal.status === "pending",
  ).length;

  function openSelection(proposal: TaskProposal) {
    setError("");
    setSelected(proposal);
    requestAnimationFrame(() => selectDialog.current?.showModal());
  }
  function openRejection(proposal: TaskProposal) {
    setError("");
    setRejecting(proposal);
    requestAnimationFrame(() => rejectDialog.current?.showModal());
  }
  function openDetail(proposal: TaskProposal) {
    setDetail(proposal);
    requestAnimationFrame(() => detailDialog.current?.showModal());
  }

  async function confirmSelection() {
    if (!selected || !session || !task || busy) return;
    setBusy(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 180));
    const result = selectSolver(task.id, selected.id, session);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    selectDialog.current?.close();
    setSelected(null);
    setNotice(
      `${result.proposal.solverName} selected. The task is now in Solver selected status.`,
    );
  }

  async function confirmRejection() {
    if (!rejecting || !session || !task || busy) return;
    setBusy(true);
    setError("");
    await new Promise((resolve) => setTimeout(resolve, 150));
    const result = rejectProposal(task.id, rejecting.id, session);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    rejectDialog.current?.close();
    setRejecting(null);
    setNotice(`Proposal from ${result.proposal.solverName} rejected.`);
  }

  if (task === undefined || session === undefined || authorized === undefined)
    return (
      <PublicShell>
        <div className="page-container proposal-review-loading" role="status">
          <div />
          <div />
          <div />
        </div>
      </PublicShell>
    );
  if (!task)
    return (
      <ReviewState
        title="Task not found"
        body="This task does not exist in the current catalogue."
      />
    );
  if (!authorized)
    return (
      <ReviewState
        title="Proposal review unavailable"
        body="Only the owner of this task can view its private proposals."
      />
    );

  return (
    <PublicShell>
      <div className="proposal-review">
        <div className="page-container">
          <TaskDashboardNav />
          <nav className="task-detail__breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Dashboard</Link>
            <span>/</span>
            <Link href="/dashboard/tasks/posted">My Posted Tasks</Link>
            <span>/</span>
            <span aria-current="page">Review Proposals</span>
          </nav>
          <header className="proposal-review__header">
            <div>
              <p className="section-kicker">Proposal review</p>
              <h1>{task.title}</h1>
              <p>
                Compare the submitted information directly. CONFLUMIX does not
                rank or recommend solvers.
              </p>
            </div>
            <div className="proposal-review__actions">
              <Link
                className="button button--secondary"
                href={`/tasks/${task.slug}`}
              >
                Return to Task
              </Link>
            </div>
          </header>
          <section
            className="proposal-review-facts"
            aria-label="Task review summary"
          >
            <div>
              <span>Task status</span>
              <strong>{taskLabels[task.status]}</strong>
            </div>
            <div>
              <span>Deadline</span>
              <strong>
                {dateFormat.format(new Date(`${task.deadline}T00:00:00`))}
              </strong>
            </div>
            <div>
              <span>Submitted proposals</span>
              <strong>{proposals.length}</strong>
            </div>
            <div>
              <span>Awaiting decision</span>
              <strong>{pending}</strong>
            </div>
          </section>
          {notice && (
            <p className="task-author-notice" role="status">
              {notice}
            </p>
          )}
          {accepted && (
            <section className="selected-solver-summary">
              <div>
                <p className="section-kicker">Selected solver</p>
                <h2>{accepted.solverName}</h2>
                <p>
                  The accepted proposal is preserved below. Other pending
                  proposals were marked not selected.
                </p>
              </div>
              <Link
                className="button button--secondary"
                href={`/dashboard/tasks/work/${task.id}`}
              >
                View Work Progress
              </Link>
            </section>
          )}
          {proposals.length === 0 ? (
            <div className="task-dashboard-empty">
              <h2>No proposals yet</h2>
              <p>
                Submitted solver proposals will appear here when someone applies
                to this task.
              </p>
              <div className="proposal-state-actions">
                <Link
                  className="button button--primary"
                  href={`/tasks/${task.slug}`}
                >
                  Return to Task
                </Link>
                <Link
                  className="button button--secondary"
                  href="/dashboard/tasks/posted"
                >
                  My Posted Tasks
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="proposal-review-toolbar">
                <div className="proposal-filters" aria-label="Filter proposals">
                  {filters.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={filter === key ? "is-active" : ""}
                      aria-pressed={filter === key}
                      onClick={() => setFilter(key)}
                    >
                      {label}
                      <span>
                        {
                          proposals.filter(
                            (proposal) =>
                              key === "all" || proposal.status === key,
                          ).length
                        }
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {visible.length === 0 ? (
                <div className="task-dashboard-empty task-dashboard-empty--compact">
                  <h2>No proposals in this status</h2>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => setFilter("all")}
                  >
                    Show all proposals
                  </button>
                </div>
              ) : (
                <main className="proposal-review-list">
                  {visible.map((proposal) => (
                    <ReviewCard
                      key={proposal.id}
                      proposal={proposal}
                      task={task}
                      selectionLocked={Boolean(accepted)}
                      onView={openDetail}
                      onSelect={openSelection}
                      onReject={openRejection}
                    />
                  ))}
                </main>
              )}
              {!accepted && pending === 0 && (
                <p className="proposal-resolved-note">
                  All submitted proposals are resolved. There is no pending
                  proposal available for selection.
                </p>
              )}
            </>
          )}
          <dialog
            ref={detailDialog}
            className="proposal-detail-dialog"
            onClose={() => setDetail(null)}
          >
            {detail && (
              <ProposalDetailContent
                proposal={detail}
                taskTitle={task.title}
                close={() => detailDialog.current?.close()}
              />
            )}
          </dialog>
          <dialog
            ref={selectDialog}
            className="task-confirm-dialog"
            onClose={() => {
              setSelected(null);
              setError("");
            }}
          >
            <h2>Select {selected?.solverName} for this task?</h2>
            <p>
              This accepts their proposal, records them as the selected solver,
              moves the task to Solver selected, and marks other pending
              proposals as not selected. A second solver cannot be selected.
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
                onClick={() => selectDialog.current?.close()}
              >
                Cancel
              </button>
              <button
                className="button button--accent"
                type="button"
                disabled={busy}
                onClick={() => void confirmSelection()}
              >
                {busy ? "Selecting…" : "Confirm Solver Selection"}
              </button>
            </div>
          </dialog>
          <dialog
            ref={rejectDialog}
            className="task-confirm-dialog"
            onClose={() => {
              setRejecting(null);
              setError("");
            }}
          >
            <h2>Reject proposal from {rejecting?.solverName}?</h2>
            <p>
              The proposal will no longer remain pending and cannot be selected
              afterward in this workflow.
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
                onClick={() => rejectDialog.current?.close()}
              >
                Cancel
              </button>
              <button
                className="button button--danger"
                type="button"
                disabled={busy}
                onClick={() => void confirmRejection()}
              >
                {busy ? "Rejecting…" : "Reject Proposal"}
              </button>
            </div>
          </dialog>
        </div>
      </div>
    </PublicShell>
  );
}

function ReviewCard({
  proposal,
  task,
  selectionLocked,
  onView,
  onSelect,
  onReject,
}: {
  proposal: TaskProposal;
  task: TaskDetail;
  selectionLocked: boolean;
  onView: (proposal: TaskProposal) => void;
  onSelect: (proposal: TaskProposal) => void;
  onReject: (proposal: TaskProposal) => void;
}) {
  const pending =
    proposal.status === "pending" &&
    !selectionLocked &&
    ["open", "reviewing"].includes(task.status);
  return (
    <article
      className={`proposal-review-card${proposal.status === "accepted" ? " is-selected" : ""}`}
    >
      <header>
        <div>
          <ProposalStatusBadge status={proposal.status} />
          <h2>{proposal.solverName}</h2>
          <p>
            Submitted{" "}
            {proposal.submittedAt
              ? dateFormat.format(new Date(proposal.submittedAt))
              : "date unavailable"}
          </p>
        </div>
        {proposal.status === "accepted" && (
          <strong className="proposal-selected-label">Selected solver</strong>
        )}
      </header>
      <section>
        <h3>Proposal message and approach</h3>
        <p>{proposal.approach}</p>
      </section>
      <section>
        <h3>Relevant experience or examples</h3>
        <p>
          {proposal.experience ||
            "No additional experience or examples were provided."}
        </p>
      </section>
      <dl>
        <div>
          <dt>Proposed completion</dt>
          <dd>
            {dateFormat.format(new Date(`${proposal.completionDate}T00:00:00`))}
          </dd>
        </div>
        <div>
          <dt>Task deadline</dt>
          <dd>{dateFormat.format(new Date(`${task.deadline}T00:00:00`))}</dd>
        </div>
        {proposal.proposedCompensation !== undefined && (
          <div>
            <dt>Proposed compensation</dt>
            <dd>{money.format(proposal.proposedCompensation)}</dd>
          </div>
        )}
      </dl>
      <footer>
        <button
          className="button button--secondary"
          type="button"
          aria-label={`View proposal from ${proposal.solverName} for ${task.title}`}
          onClick={() => onView(proposal)}
        >
          View Proposal
        </button>
        {pending && (
          <>
            <button
              className="button button--accent"
              type="button"
              aria-label={`Select ${proposal.solverName} for ${task.title}`}
              onClick={() => onSelect(proposal)}
            >
              Select Solver
            </button>
            <button
              className="proposal-reject"
              type="button"
              aria-label={`Reject proposal from ${proposal.solverName} for ${task.title}`}
              onClick={() => onReject(proposal)}
            >
              Reject Proposal
            </button>
          </>
        )}
      </footer>
    </article>
  );
}

function ReviewState({ title, body }: { title: string; body: string }) {
  return (
    <PublicShell>
      <div className="page-container task-detail-missing">
        <p className="section-kicker">Proposal review</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <Link className="button button--primary" href="/dashboard/tasks/posted">
          My Posted Tasks
        </Link>
      </div>
    </PublicShell>
  );
}
