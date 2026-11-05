"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import type { TaskDetail } from "@/types/tasks";
import { PublicShell } from "@/components/public/public-shell";
import {
  getProposalsForTask,
  proposalEligibility,
} from "@/services/task-proposals";

const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const labels = {
  open: "Open for proposals",
  reviewing: "Under review",
  "solver-selected": "Solver selected",
  "in-progress": "In progress",
  submitted: "Submitted for review",
  revision: "Revision requested",
  completed: "Completed",
  cancelled: "Cancelled",
  closed: "Closed",
  expired: "Expired",
} as const;
export function TaskDetailPage({ task }: { task: TaskDetail }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  useEffect(() => {
    void readAuthSession().then(setSession);
  }, []);
  const proposalState = proposalEligibility(task, session);
  const owner = !proposalState.allowed && proposalState.reason === "owner";
  const eligible = task.status === "open" && !owner;
  const proposalCount = getProposalsForTask(task.id).length;
  const browseHref = "/tasks/browse";
  return (
    <PublicShell>
      <div className="task-detail">
        <div className="page-container">
          <nav className="task-detail__breadcrumb" aria-label="Breadcrumb">
            <Link href="/marketplace">Marketplace</Link>
            <span>/</span>
            <Link href="/tasks">Tasks</Link>
            <span>/</span>
            <Link href={browseHref}>Browse Tasks</Link>
            <span>/</span>
            <span aria-current="page">{task.title}</span>
          </nav>
          <header className="task-detail__header">
            <div className="task-detail__labels">
              <span>{task.category}</span>
              <strong className={`task-status task-status--${task.status}`}>
                {labels[task.status]}
              </strong>
            </div>
            <h1>{task.title}</h1>
            <p>
              Posted by <strong>{task.owner}</strong> on{" "}
              <time dateTime={task.createdAt}>
                {new Intl.DateTimeFormat("en-PK", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(new Date(task.createdAt))}
              </time>
            </p>
            <div className="task-skills">
              {task.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </header>
          <div className="task-detail__layout">
            <main className="task-detail__main">
              <section>
                <p className="section-kicker">Task overview</p>
                <h2>The problem to solve</h2>
                <p className="task-detail__lead">{task.description}</p>
              </section>
              <section>
                <p className="section-kicker">Scope and expectations</p>
                <h2>What successful completion looks like</h2>
                <h3>Expected deliverable</h3>
                <p>{task.expectedDeliverable}</p>
                <h3>Relevant requirements</h3>
                <ul>
                  {task.requirements.map((value) => (
                    <li key={value}>{value}</li>
                  ))}
                </ul>
                <h3>Submission expectations</h3>
                <p>{task.submissionExpectation}</p>
                <p className="task-detail__boundary">
                  This page communicates the brief only. Deliverable submission
                  becomes available in the later task-work workflow.
                </p>
              </section>
              <section className="task-owner">
                <p className="section-kicker">Task owner</p>
                <div className="task-owner__identity">
                  <span aria-hidden="true">
                    {task.owner
                      .split(" ")
                      .map((value) => value[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <div>
                    <h2>{task.owner}</h2>
                    <p>Owner locality: {task.locality}</p>
                  </div>
                </div>
                <p>
                  No owner ratings, verification claims, reviews, or activity
                  metrics are available in the current frontend data.
                </p>
              </section>
            </main>
            <aside className="task-detail__side">
              <section className="task-brief-facts">
                <h2>Opportunity brief</h2>
                <dl>
                  <div>
                    <dt>Compensation</dt>
                    <dd>{money.format(task.budget)}</dd>
                  </div>
                  <div>
                    <dt>Deadline</dt>
                    <dd>
                      <time dateTime={task.deadline}>
                        {new Intl.DateTimeFormat("en-PK", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(`${task.deadline}T00:00:00`))}
                      </time>
                    </dd>
                  </div>
                  <div>
                    <dt>Work arrangement</dt>
                    <dd>{task.arrangement}</dd>
                  </div>
                  <div>
                    <dt>Owner locality</dt>
                    <dd>{task.locality}</dd>
                  </div>
                </dl>
                <p>
                  Locality identifies the owner’s context. This task remains
                  remote.
                </p>
              </section>
              <section className="task-proposal">
                <p className="section-kicker">Proposals</p>
                <h2>
                  {eligible
                    ? "Ready to propose a solution?"
                    : owner
                      ? "You own this task"
                      : task.status === "reviewing"
                        ? "Proposals are under review"
                        : "Proposals are unavailable"}
                </h2>
                <p>
                  {eligible
                    ? "Review the brief, then continue to the protected proposal workflow."
                    : owner
                      ? "Owner management is reserved for the future edit and proposal-review workflows."
                      : task.status === "expired"
                        ? "The deadline has passed, so this task no longer accepts proposals."
                        : task.status === "closed"
                          ? "This task is closed and does not accept proposals."
                          : "A solver has already been selected or work is underway."}
                </p>
                {eligible && (
                  <Link
                    className="button button--accent"
                    href={
                      session
                        ? `/tasks/${task.slug}/propose`
                        : `/auth/required?next=${encodeURIComponent(`/tasks/${task.slug}/propose`)}`
                    }
                  >
                    Submit Proposal
                  </Link>
                )}
                {owner && (
                  <>
                    <Link
                      className="button button--primary"
                      href={`/tasks/${task.slug}/edit`}
                    >
                      Edit Task
                    </Link>
                    <Link
                      className="button button--secondary"
                      href="/dashboard/tasks/posted"
                    >
                      Manage Posted Tasks
                    </Link>
                  </>
                )}
                <Link className="task-return" href={browseHref}>
                  Return to Browse Tasks
                </Link>
                <small>
                  {proposalCount === 0
                    ? "No submitted proposals are recorded in this browser yet."
                    : `${proposalCount} submitted ${proposalCount === 1 ? "proposal" : "proposals"} recorded in this browser.`}
                </small>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
