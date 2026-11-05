"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import {
  canWithdrawProposal,
  getProposalsBySolver,
  taskProposalEvent,
  withdrawProposal,
} from "@/services/task-proposals";
import { findTask } from "@/services/tasks";
import type { ProposalStatus, TaskProposal } from "@/types/tasks";
import { ProposalStatusBadge } from "./proposal-status-badge";
import { TaskDashboardNav } from "./task-dashboard-nav";
import { ProposalDetailContent } from "./proposal-detail-content";

type Filter = "all" | Exclude<ProposalStatus, "draft"> | "historical";
const filters: Array<[Filter, string]> = [
  ["all", "All"],
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["rejected", "Rejected"],
  ["withdrawn", "Withdrawn"],
  ["historical", "Completed / historical"],
];
const dateFormat = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

function validFilter(value: string | null): Filter {
  return filters.some(([key]) => key === value) ? (value as Filter) : "all";
}

export function MyProposalsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const detailDialog = useRef<HTMLDialogElement>(null);
  const withdrawDialog = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<AuthSession | null>();
  const [records, setRecords] = useState<TaskProposal[]>([]);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<TaskProposal | null>(null);
  const [withdrawing, setWithdrawing] = useState<TaskProposal | null>(null);
  const [error, setError] = useState("");
  const filter = validFilter(params.get("status"));

  useEffect(() => {
    let active = true;
    let refresh: () => void = () => {};
    void readAuthSession().then((current) => {
      if (!active) return;
      if (!current) {
        router.replace("/auth/login?next=%2Fdashboard%2Ftasks%2Fproposals");
        return;
      }
      setSession(current);
      refresh = () => setRecords(getProposalsBySolver(current.email));
      refresh();
      setReady(true);
      window.addEventListener(taskProposalEvent, refresh);
    });
    return () => {
      active = false;
      window.removeEventListener(taskProposalEvent, refresh);
    };
  }, [router]);

  const visible = records.filter(
    (proposal) =>
      filter === "all" ||
      (filter === "historical"
        ? proposal.status === "completed"
        : proposal.status === filter),
  );

  function setFilter(value: Filter) {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete("status");
    else next.set("status", value);
    next.delete("submitted");
    router.push(`/dashboard/tasks/proposals${next.size ? `?${next}` : ""}`);
  }

  function openDetail(proposal: TaskProposal) {
    setSelected(proposal);
    requestAnimationFrame(() => detailDialog.current?.showModal());
  }

  function requestWithdrawal(proposal: TaskProposal) {
    setError("");
    setWithdrawing(proposal);
    requestAnimationFrame(() => withdrawDialog.current?.showModal());
  }

  function confirmWithdrawal() {
    if (!withdrawing || !session) return;
    if (!withdrawProposal(withdrawing.id, session.email)) {
      setError(
        "This proposal can no longer be withdrawn. Refresh and review its current status.",
      );
      return;
    }
    withdrawDialog.current?.close();
    setWithdrawing(null);
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
              <h1>My Proposals</h1>
              <p>
                Track applications you submitted to solve other members&apos;
                tasks.
              </p>
            </div>
            <Link className="button button--primary" href="/tasks/browse">
              Browse Tasks
            </Link>
          </header>
          {params.get("submitted") === "1" && (
            <p className="task-author-notice" role="status">
              Proposal submitted. The task owner can now review it.
            </p>
          )}
          {records.length === 0 ? (
            <div className="task-dashboard-empty">
              <h2>You haven&apos;t submitted any proposals yet.</h2>
              <p>
                Browse open tasks and apply to solve a problem that fits your
                experience.
              </p>
              <Link className="button button--primary" href="/tasks/browse">
                Browse Tasks
              </Link>
            </div>
          ) : (
            <>
              <div
                className="proposal-filters"
                aria-label="Filter proposals by status"
              >
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
                        records.filter(
                          (proposal) =>
                            key === "all" ||
                            (key === "historical"
                              ? proposal.status === "completed"
                              : proposal.status === key),
                        ).length
                      }
                    </span>
                  </button>
                ))}
              </div>
              {visible.length === 0 ? (
                <div className="task-dashboard-empty task-dashboard-empty--compact">
                  <h2>
                    No{" "}
                    {filters.find(([key]) => key === filter)?.[1].toLowerCase()}{" "}
                    proposals
                  </h2>
                  <p>There are no proposals in this status.</p>
                  <button
                    className="button button--secondary"
                    type="button"
                    onClick={() => setFilter("all")}
                  >
                    Show all proposals
                  </button>
                </div>
              ) : (
                <div className="proposal-management-list">
                  {visible.map((proposal) => (
                    <ProposalItem
                      key={proposal.id}
                      proposal={proposal}
                      onView={openDetail}
                      onWithdraw={requestWithdrawal}
                    />
                  ))}
                </div>
              )}
            </>
          )}
          <dialog
            ref={detailDialog}
            className="proposal-detail-dialog"
            onClose={() => setSelected(null)}
          >
            {selected && (
              <ProposalDetailContent
                proposal={selected}
                taskTitle={
                  findTask(selected.taskId)?.title ?? "Task unavailable"
                }
                close={() => detailDialog.current?.close()}
              />
            )}
          </dialog>
          <dialog
            ref={withdrawDialog}
            className="task-confirm-dialog"
            onClose={() => setWithdrawing(null)}
          >
            <h2>Withdraw this proposal?</h2>
            <p>
              The task owner will no longer be able to consider it. The task
              itself will not change.
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
                onClick={() => withdrawDialog.current?.close()}
              >
                Keep proposal
              </button>
              <button
                className="button button--danger"
                type="button"
                onClick={confirmWithdrawal}
              >
                Withdraw Proposal
              </button>
            </div>
          </dialog>
        </div>
      </div>
    </PublicShell>
  );
}

function ProposalItem({
  proposal,
  onView,
  onWithdraw,
}: {
  proposal: TaskProposal;
  onView: (proposal: TaskProposal) => void;
  onWithdraw: (proposal: TaskProposal) => void;
}) {
  const task = findTask(proposal.taskId);
  if (!task)
    return (
      <article className="proposal-list-item">
        <div>
          <ProposalStatusBadge status={proposal.status} />
          <h2>Task unavailable</h2>
          <p>The related browser-local task record cannot be resolved.</p>
        </div>
        <button type="button" onClick={() => onView(proposal)}>
          View Proposal
        </button>
      </article>
    );
  const activeWork =
    proposal.status === "accepted" &&
    [
      "solver-selected",
      "in-progress",
      "submitted",
      "revision",
      "completed",
      "cancelled",
      "closed",
    ].includes(task.status);
  return (
    <article className="proposal-list-item">
      <div className="proposal-list-item__identity">
        <ProposalStatusBadge status={proposal.status} />
        <h2>
          <Link href={`/tasks/${task.slug}`}>{task.title}</Link>
        </h2>
        <p>
          Task owner: <strong>{task.owner}</strong>
        </p>
      </div>
      <dl>
        <div>
          <dt>Submitted</dt>
          <dd>
            {proposal.submittedAt
              ? dateFormat.format(new Date(proposal.submittedAt))
              : "Not submitted"}
          </dd>
        </div>
        <div>
          <dt>Proposed timeline</dt>
          <dd>
            {dateFormat.format(new Date(`${proposal.completionDate}T00:00:00`))}
          </dd>
        </div>
        {proposal.proposedCompensation !== undefined && (
          <div>
            <dt>Proposed compensation</dt>
            <dd>{money.format(proposal.proposedCompensation)}</dd>
          </div>
        )}
        <div>
          <dt>Latest update</dt>
          <dd>{proposal.latestUpdate}</dd>
        </div>
      </dl>
      <div className="proposal-list-actions">
        <button type="button" onClick={() => onView(proposal)}>
          View Proposal
        </button>
        <Link href={`/tasks/${task.slug}`}>View Task</Link>
        {canWithdrawProposal(proposal) && (
          <button
            className="is-danger"
            type="button"
            onClick={() => onWithdraw(proposal)}
          >
            Withdraw Proposal
          </button>
        )}
        {activeWork && (
          <Link href={`/dashboard/tasks/work/${task.id}`}>
            View Active Work
          </Link>
        )}
      </div>
    </article>
  );
}
