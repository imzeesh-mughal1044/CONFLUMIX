import Link from "next/link";
import type { TaskOpportunity } from "@/types/tasks";

const money = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});
const statusLabels = {
  open: "Open",
  reviewing: "Under review",
  "solver-selected": "Solver selected",
  "in-progress": "In progress",
  submitted: "Submitted",
  revision: "Revision requested",
  completed: "Completed",
  cancelled: "Cancelled",
  closed: "Closed",
  expired: "Expired",
} as const;
export function TaskCard({
  task,
  compact = false,
}: {
  task: TaskOpportunity;
  compact?: boolean;
}) {
  const unavailable = task.status === "closed" || task.status === "expired";
  return (
    <article
      className={`task-card${compact ? " task-card--compact" : ""}${unavailable ? " is-unavailable" : ""}`}
    >
      <div className="task-card__top">
        <span>{task.category}</span>
        <span className={`task-status task-status--${task.status}`}>
          {statusLabels[task.status]}
        </span>
      </div>
      <div className="task-card__content">
        <h3>{task.title}</h3>
        <p>{task.description}</p>
        <div className="task-skills" aria-label="Required skills">
          {task.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>
      <dl className="task-facts">
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
                month: "short",
                year: "numeric",
              }).format(new Date(`${task.deadline}T00:00:00`))}
            </time>
          </dd>
        </div>
        <div>
          <dt>Arrangement</dt>
          <dd>{task.arrangement}</dd>
        </div>
      </dl>
      <div className="task-card__footer">
        <div>
          <span>Posted by</span>
          <strong>{task.owner}</strong>
          <small>Owner locality: {task.locality}</small>
        </div>
        <Link className="button button--secondary" href={`/tasks/${task.slug}`}>
          View Task
        </Link>
      </div>
      {unavailable && (
        <p className="task-availability-note">
          {task.status === "expired"
            ? "The deadline has passed and this task is not accepting proposals."
            : "This task is closed and is not accepting proposals."}
        </p>
      )}
    </article>
  );
}
