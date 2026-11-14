"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { browseTasks, taskLocalities, taskSkills } from "@/services/tasks";
import {
  taskCategories,
  type TaskCategory,
  type TaskQuery,
  type TaskSort,
  type TaskStatus,
} from "@/types/tasks";
import { Breadcrumb, PublicShell } from "@/components/public/public-shell";
import { Icon } from "@/components/public/icons";
import {EmptyState} from "@/components/system/async-state";
import { TaskCard } from "./task-card";

const categorySlugs = Object.fromEntries(
  taskCategories.map((value) => [
    value.toLowerCase().replaceAll(" ", "-"),
    value,
  ]),
) as Record<string, TaskCategory>;
const statuses: TaskStatus[] = [
    "open",
    "reviewing",
    "in-progress",
    "closed",
    "expired",
  ],
  sorts: TaskSort[] = ["newest", "deadline", "budget-high", "budget-low"];
export function TaskBrowser() {
  const params = useSearchParams(),
    pathname = usePathname(),
    router = useRouter(),
    closeRef = useRef<HTMLButtonElement>(null);
  const [search, setSearch] = useState(params.get("q") ?? ""),
    [filtersOpen, setFiltersOpen] = useState(false),
    [visible, setVisible] = useState(6);
  const rawCategory = params.get("category") ?? "",
    category =
      categorySlugs[rawCategory] ??
      (taskCategories.includes(rawCategory as TaskCategory)
        ? (rawCategory as TaskCategory)
        : undefined),
    status = statuses.includes(params.get("status") as TaskStatus)
      ? (params.get("status") as TaskStatus)
      : undefined,
    sort = sorts.includes(params.get("sort") as TaskSort)
      ? (params.get("sort") as TaskSort)
      : "newest",
    skills = (params.get("skills") ?? "")
      .split(",")
      .filter((value) =>
        taskSkills.some((skill) => skill.toLowerCase() === value.toLowerCase()),
      ),
    budget = ["under-5000", "5000-10000", "over-10000"].includes(
      params.get("budget") ?? "",
    )
      ? (params.get("budget") as TaskQuery["budget"])
      : undefined,
    deadline = ["7-days", "30-days", "later"].includes(
      params.get("deadline") ?? "",
    )
      ? (params.get("deadline") as TaskQuery["deadline"])
      : undefined,
    arrangement = params.get("arrangement") === "remote" ? "remote" : undefined,
    locality = taskLocalities.find(
      (value) => value.toLowerCase() === params.get("locality")?.toLowerCase(),
    );
  const query: TaskQuery = {
    q: params.get("q") ?? undefined,
    category,
    status,
    sort,
    skills,
    budget,
    deadline,
    arrangement,
    locality,
  };
  const items = browseTasks(query);
  const activeCount = [
    category,
    status,
    budget,
    deadline,
    arrangement,
    locality,
    ...skills,
  ].filter(Boolean).length;
  useEffect(() => {
    if (!filtersOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const close = (event: KeyboardEvent) =>
      event.key === "Escape" && setFiltersOpen(false);
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", close);
    };
  }, [filtersOpen]);
  function update(changes: Record<string, string | undefined>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    setVisible(6);
    router.push(`${pathname}${next.size ? `?${next}` : ""}`);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    update({ q: search.trim() || undefined });
  }
  function clearAll() {
    setSearch("");
    router.push(pathname);
    setFiltersOpen(false);
  }
  function toggleSkill(skill: string) {
    const next = skills.includes(skill)
      ? skills.filter((value) => value !== skill)
      : [...skills, skill];
    update({ skills: next.length ? next.join(",") : undefined });
  }
  return (
    <PublicShell>
      <div className="task-browse">
        <div className="page-container">
          <Breadcrumb current="Browse Tasks" />
          <header className="task-browse__header">
            <p className="section-kicker">Task &amp; Soft Skills Marketplace</p>
            <h1>Browse Tasks</h1>
            <p>
              Compare focused problems by required skills, compensation,
              deadline, and availability.
            </p>
          </header>
          <form className="task-search task-search--browse" onSubmit={submit}>
            <label className="sr-only" htmlFor="browse-task-search">
              Search tasks
            </label>
            <Icon name="search" />
            <input
              id="browse-task-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks, skills, or problems"
            />
            <button type="submit">Search</button>
          </form>
          <div className="task-toolbar">
            <button
              className="task-filter-trigger"
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(true)}
            >
              Filters{activeCount ? ` (${activeCount})` : ""}
            </button>
            <p aria-live="polite">
              <strong>{items.length}</strong>{" "}
              {items.length === 1 ? "task" : "tasks"}
            </p>
            <label>
              Sort by
              <select
                value={sort}
                onChange={(event) =>
                  update({
                    sort:
                      event.target.value === "newest"
                        ? undefined
                        : event.target.value,
                  })
                }
              >
                <option value="newest">Newest</option>
                <option value="deadline">Deadline</option>
                <option value="budget-high">Budget: High to Low</option>
                <option value="budget-low">Budget: Low to High</option>
              </select>
            </label>
          </div>
          {activeCount > 0 && (
            <div className="task-active-filters">
              <span>Active filters</span>
              {category && (
                <Chip
                  label={category}
                  remove={() => update({ category: undefined })}
                />
              )}{" "}
              {status && (
                <Chip
                  label={status.replaceAll("-", " ")}
                  remove={() => update({ status: undefined })}
                />
              )}{" "}
              {skills.map((skill) => (
                <Chip
                  key={skill}
                  label={skill}
                  remove={() => toggleSkill(skill)}
                />
              ))}
              {budget && (
                <Chip
                  label={budget.replaceAll("-", " ")}
                  remove={() => update({ budget: undefined })}
                />
              )}{" "}
              {deadline && (
                <Chip
                  label={deadline.replaceAll("-", " ")}
                  remove={() => update({ deadline: undefined })}
                />
              )}{" "}
              {arrangement && (
                <Chip
                  label="Remote"
                  remove={() => update({ arrangement: undefined })}
                />
              )}{" "}
              {locality && (
                <Chip
                  label={locality}
                  remove={() => update({ locality: undefined })}
                />
              )}
              <button type="button" onClick={clearAll}>
                Clear all
              </button>
            </div>
          )}
          <div className="task-browse__layout">
            <button
              className={`task-filter-scrim${filtersOpen ? " is-open" : ""}`}
              type="button"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            />
            <aside
              className={`task-filters${filtersOpen ? " is-open" : ""}`}
              aria-label="Task filters"
            >
              <div className="task-filters__title">
                <h2>Refine tasks</h2>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setFiltersOpen(false)}
                >
                  <Icon name="close" />
                </button>
              </div>
              <label>
                Category
                <select
                  value={category ?? ""}
                  onChange={(event) =>
                    update({ category: event.target.value || undefined })
                  }
                >
                  <option value="">All categories</option>
                  {taskCategories.map((value) => (
                    <option
                      key={value}
                      value={value.toLowerCase().replaceAll(" ", "-")}
                    >
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset>
                <legend>Required skills</legend>
                <div className="task-skill-options">
                  {taskSkills.map((skill) => (
                    <label key={skill}>
                      <input
                        type="checkbox"
                        checked={skills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>
                Task status
                <select
                  value={status ?? ""}
                  onChange={(event) =>
                    update({ status: event.target.value || undefined })
                  }
                >
                  <option value="">All public statuses</option>
                  <option value="open">Open</option>
                  <option value="reviewing">Under review</option>
                  <option value="in-progress">In progress</option>
                  <option value="closed">Closed</option>
                  <option value="expired">Expired</option>
                </select>
              </label>
              <label>
                Budget range
                <select
                  value={budget ?? ""}
                  onChange={(event) =>
                    update({ budget: event.target.value || undefined })
                  }
                >
                  <option value="">Any budget</option>
                  <option value="under-5000">Under PKR 5,000</option>
                  <option value="5000-10000">PKR 5,000–10,000</option>
                  <option value="over-10000">Over PKR 10,000</option>
                </select>
              </label>
              <label>
                Deadline
                <select
                  value={deadline ?? ""}
                  onChange={(event) =>
                    update({ deadline: event.target.value || undefined })
                  }
                >
                  <option value="">Any deadline</option>
                  <option value="7-days">Within 7 days</option>
                  <option value="30-days">Within 30 days</option>
                  <option value="later">Later than 30 days</option>
                </select>
              </label>
              <label>
                Work arrangement
                <select
                  value={arrangement ?? ""}
                  onChange={(event) =>
                    update({ arrangement: event.target.value || undefined })
                  }
                >
                  <option value="">All arrangements</option>
                  <option value="remote">Remote</option>
                </select>
              </label>
              <label>
                Owner locality
                <select
                  value={locality ?? ""}
                  onChange={(event) =>
                    update({
                      locality: event.target.value.toLowerCase() || undefined,
                    })
                  }
                >
                  <option value="">All localities</option>
                  {taskLocalities.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <div className="task-filter-actions">
                <button
                  className="button button--secondary"
                  type="button"
                  onClick={clearAll}
                >
                  Clear filters
                </button>
                <button
                  className="button button--primary"
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                >
                  Apply filters
                </button>
              </div>
            </aside>
            <main className="task-results">
              {items.length ? (
                <>
                  <div className="task-list">
                    {items.slice(0, visible).map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                  {visible < items.length && (
                    <button
                      className="button button--secondary task-load-more"
                      type="button"
                      onClick={() => setVisible((count) => count + 6)}
                    >
                      Load more tasks
                    </button>
                  )}
                </>
              ) : (
                <EmptyState title="No Tasks Found" description="No tasks currently match your selected filters. Try changing your search criteria." actions={[{label:"Clear Filters",onClick:clearAll,variant:"primary"},{label:"Explore Other Tasks",href:"/tasks",variant:"secondary"}]} />
              )}
            </main>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
function Chip({ label, remove }: { label: string; remove: () => void }) {
  return (
    <span>
      {label}
      <button
        type="button"
        aria-label={`Remove ${label} filter`}
        onClick={remove}
      >
        ×
      </button>
    </span>
  );
}
