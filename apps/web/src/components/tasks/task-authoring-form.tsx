"use client";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { PublicShell } from "@/components/public/public-shell";
import { TaskCard } from "./task-card";
import {
  customTaskCategory,
  taskAuthoringCategories,
  taskAuthoringGroups,
} from "@/data/task-authoring";
import {
  closeAuthoredTask,
  findAuthoredTask,
  readAuthoredTasks,
  saveAuthoredTask,
  slugifyTask,
} from "@/services/task-authoring";
import { findTask } from "@/services/tasks";
import { readAuthSession, type AuthSession } from "@/lib/auth";
import type {
  AuthoredTask,
  TaskAuthoringCategory,
  TaskBudgetType,
  TaskDetail,
  TaskDuration,
  TaskExperience,
} from "@/types/tasks";

type FormState = {
  title: string;
  description: string;
  categoryId: string;
  customCategoryName: string;
  skills: string[];
  expectedDeliverable: string;
  capability: string;
  experience: TaskExperience;
  submissionExpectation: string;
  deadline: string;
  duration: TaskDuration;
  budgetType: TaskBudgetType;
  budget: string;
  compensationConditions: string;
  categoryFields: Record<string, string>;
};
const empty: FormState = {
  title: "",
  description: "",
  categoryId: "",
  customCategoryName: "",
  skills: [],
  expectedDeliverable: "",
  capability: "",
  experience: "Intermediate",
  submissionExpectation: "",
  deadline: "",
  duration: "1–3 days",
  budgetType: "Fixed price",
  budget: "",
  compensationConditions: "",
  categoryFields: {},
};
const today = "2026-11-04";
function broadCategory(category?: TaskAuthoringCategory) {
  if (!category) return "Other";
  if (category.group === "Design & Multimedia") return "Design";
  if (category.group === "Writing, Language & Documents")
    return category.id === "research" ? "Research" : "Writing";
  if (category.group === "Data & Analytics") return "Data Analysis";
  if (category.group === "Administrative & Educational Tasks")
    return "Office and Digital Support";
  if (category.group === "Marketing & Online Business")
    return "Office and Digital Support";
  return "Programming";
}
function initialFromTask(task: TaskDetail): FormState {
  const match =
    taskAuthoringCategories.find(
      (category) => category.label === task.category,
    ) ||
    taskAuthoringCategories.find(
      (category) =>
        category.group === "Data & Analytics" &&
        task.category === "Data Analysis",
    ) ||
    taskAuthoringCategories.find(
      (category) =>
        category.group === "Software & Development" &&
        task.category === "Programming",
    ) ||
    taskAuthoringCategories.find(
      (category) =>
        category.group === "Design & Multimedia" && task.category === "Design",
    ) ||
    taskAuthoringCategories.find(
      (category) => category.id === "research" && task.category === "Research",
    ) ||
    taskAuthoringCategories.find(
      (category) =>
        category.group === "Writing, Language & Documents" &&
        task.category === "Writing",
    ) ||
    taskAuthoringCategories.find(
      (category) =>
        category.group === "Administrative & Educational Tasks" &&
        task.category === "Office and Digital Support",
    );
  const authored = findAuthoredTask(task.id);
  if (authored)
    return {
      title: authored.title,
      description: authored.description,
      categoryId: authored.authoringCategory,
      customCategoryName: authored.customCategoryName ?? "",
      skills: authored.skills,
      expectedDeliverable: authored.expectedDeliverable,
      capability: authored.capability,
      experience: authored.experience,
      submissionExpectation: authored.submissionExpectation,
      deadline: authored.deadline,
      duration: authored.duration,
      budgetType: authored.budgetType,
      budget: String(authored.budget),
      compensationConditions: authored.compensationConditions,
      categoryFields: authored.categoryFields,
    };
  return {
    ...empty,
    title: task.title,
    description: task.description,
    categoryId: match?.id ?? "custom",
    customCategoryName: match ? "" : task.category,
    skills: task.skills,
    expectedDeliverable: task.expectedDeliverable,
    capability: task.requirements.join("\n"),
    submissionExpectation: task.submissionExpectation,
    deadline: task.deadline,
    budget: String(task.budget),
  };
}
export function TaskAuthoringForm({
  mode,
  identifier,
}: {
  mode: "create" | "edit";
  identifier?: string;
}) {
  const router = useRouter(),
    summaryRef = useRef<HTMLDivElement>(null),
    previewRef = useRef<HTMLDialogElement>(null),
    closeRef = useRef<HTMLDialogElement>(null),
    discardRef = useRef<HTMLDialogElement>(null),
    categoryRef = useRef<HTMLDialogElement>(null);
  const [session, setSession] = useState<AuthSession | null | undefined>(
      undefined,
    ),
    [state, setState] = useState<FormState>(empty),
    [original, setOriginal] = useState(""),
    [task, setTask] = useState<TaskDetail | null | undefined>(
      mode === "edit" ? undefined : null,
    ),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [skillDraft, setSkillDraft] = useState(""),
    [categorySearch, setCategorySearch] = useState(""),
    [files, setFiles] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [pendingCategory, setPendingCategory] = useState(""),
    [draftIdentity, setDraftIdentity] = useState<{
      id: string;
      slug: string;
      createdAt: string;
    } | null>(null);
  useEffect(() => {
    void readAuthSession().then((value) => {
      setSession(value);
      if (!value) {
        router.replace(
          `/auth/required?next=${encodeURIComponent(mode === "create" ? "/tasks/new" : `/tasks/${identifier}/edit`)}`,
        );
        return;
      }
      if (mode === "edit" && identifier) {
        const found = findTask(identifier);
        setTask(found ?? null);
        if (found) {
          const initial = initialFromTask(found);
          setState(initial);
          setOriginal(JSON.stringify(initial));
        }
      } else {
        const draft = readAuthoredTasks().find(
          (item) => item.status === "draft" && item.ownerEmail === value.email,
        );
        if (draft) {
          const initial = initialFromTask({ ...draft, status: "open" });
          setState(initial);
          setOriginal(JSON.stringify(initial));
          setDraftIdentity({
            id: draft.id,
            slug: draft.slug,
            createdAt: draft.createdAt,
          });
          setNotice("Your latest browser-local draft has been restored.");
        } else setOriginal(JSON.stringify(empty));
      }
    });
  }, [identifier, mode, router]);
  const category =
    state.categoryId === "custom"
      ? customTaskCategory
      : taskAuthoringCategories.find((item) => item.id === state.categoryId);
  const dirty = JSON.stringify(state) !== original;
  const filtered = taskAuthoringCategories.filter(
    (item) =>
      !categorySearch.trim() ||
      `${item.label} ${item.group}`
        .toLowerCase()
        .includes(categorySearch.toLowerCase()),
  );
  const editable =
    mode === "create" ||
    Boolean(
      task &&
        session &&
        task.owner.toLowerCase() === session.fullName.trim().toLowerCase() &&
        task.status === "open",
    );
  const previewTask = useMemo<TaskDetail>(
    () => ({
      id: task?.id ?? "preview-task",
      slug: task?.slug ?? "preview-task",
      title: state.title || "Your task title",
      description:
        state.description || "Your task description will appear here.",
      category:
        state.categoryId === "custom"
          ? state.customCategoryName || "Other"
          : broadCategory(category),
      skills: state.skills.length ? state.skills : ["Required skill"],
      budget: Number(state.budget) || 0,
      deadline: state.deadline || "2026-12-01",
      status: task?.status ?? "open",
      owner: session?.fullName || "Task owner",
      arrangement: "Remote",
      locality: task?.locality ?? "Lahore",
      createdAt: task?.createdAt ?? new Date().toISOString(),
      expectedDeliverable: state.expectedDeliverable || "Expected deliverable",
      requirements: [
        state.capability,
        ...Object.entries(state.categoryFields)
          .filter(([, value]) => value)
          .map(
            ([id, value]) =>
              `${category?.fields.find((field) => field.id === id)?.label}: ${value}`,
          ),
      ].filter(Boolean),
      submissionExpectation:
        state.submissionExpectation || "Submission expectations",
    }),
    [category, session, state, task],
  );
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }
  function validate() {
    const next: Record<string, string> = {};
    if (state.title.trim().length < 10)
      next.title = "Use at least 10 characters for a clear task title.";
    if (state.description.trim().length < 30)
      next.description =
        "Describe the problem and context in at least 30 characters.";
    if (!state.categoryId) next.categoryId = "Choose a task category.";
    if (state.categoryId === "custom" && !state.customCategoryName.trim())
      next.customCategoryName = "Name the custom category.";
    if (!state.skills.length) next.skills = "Add at least one required skill.";
    if (state.expectedDeliverable.trim().length < 10)
      next.expectedDeliverable = "Explain what the solver should deliver.";
    if (state.capability.trim().length < 10)
      next.capability = "Describe the necessary experience or capability.";
    if (!state.submissionExpectation.trim())
      next.submissionExpectation =
        "Explain how the deliverable should be submitted.";
    if (!state.deadline || state.deadline <= today)
      next.deadline = "Choose a deadline after 4 November 2026.";
    if (!Number.isFinite(Number(state.budget)) || Number(state.budget) <= 0)
      next.budget = "Enter a compensation amount greater than zero.";
    category?.fields
      .filter((field) => field.required)
      .forEach((field) => {
        if (!state.categoryFields[field.id]?.trim())
          next[`category-${field.id}`] = `${field.label} is required.`;
      });
    setErrors(next);
    if (Object.keys(next).length) {
      queueMicrotask(() => summaryRef.current?.focus());
      return false;
    }
    return true;
  }
  function addSkill() {
    const value = skillDraft.trim();
    if (
      value &&
      !state.skills.some((skill) => skill.toLowerCase() === value.toLowerCase())
    )
      set("skills", [...state.skills, value]);
    setSkillDraft("");
  }
  function record(status: "draft" | "open") {
    if (!session) return null;
    const now = new Date().toISOString(),
      id = task?.id ?? draftIdentity?.id ?? `task-local-${Date.now()}`,
      slug =
        task?.slug ??
        draftIdentity?.slug ??
        `${slugifyTask(state.title)}-${Date.now().toString().slice(-6)}`;
    return {
      ...previewTask,
      id,
      slug,
      owner: session.fullName,
      ownerEmail: session.email,
      authoringCategory: state.categoryId,
      customCategoryName: state.customCategoryName || undefined,
      experience: state.experience,
      capability: state.capability,
      duration: state.duration,
      budgetType: state.budgetType,
      compensationConditions: state.compensationConditions,
      categoryFields: state.categoryFields,
      status,
      updatedAt: now,
      createdAt: task?.createdAt ?? draftIdentity?.createdAt ?? now,
    } satisfies AuthoredTask;
  }
  async function save(kind: "draft" | "publish" | "changes") {
    if (kind !== "draft" && !validate()) return;
    if (kind === "draft" && !state.title.trim()) {
      setErrors({ title: "Add a title before saving a draft." });
      summaryRef.current?.focus();
      return;
    }
    const value = record(kind === "draft" ? "draft" : "open");
    if (!value) return;
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 180));
    saveAuthoredTask(value);
    setDraftIdentity({
      id: value.id,
      slug: value.slug,
      createdAt: value.createdAt,
    });
    setOriginal(JSON.stringify(state));
    setBusy(false);
    setNotice(
      kind === "draft"
        ? "Draft saved in this browser."
        : kind === "changes"
          ? "Changes saved in this browser."
          : "Task published in this browser-local prototype.",
    );
    if (kind !== "draft") router.push(`/tasks/${value.slug}`);
  }
  function preview() {
    if (validate()) previewRef.current?.showModal();
  }
  function cancel() {
    if (dirty) discardRef.current?.showModal();
    else
      router.push(mode === "edit" && task ? `/tasks/${task.slug}` : "/tasks");
  }
  function selectCategory(value: string) {
    if (Object.values(state.categoryFields).some(Boolean)) {
      setPendingCategory(value);
      categoryRef.current?.showModal();
    } else set("categoryId", value);
  }
  if (session === undefined || task === undefined)
    return (
      <PublicShell>
        <div className="task-author-loading">Loading task editor…</div>
      </PublicShell>
    );
  if (!session)
    return (
      <PublicShell>
        <div className="task-author-loading">Redirecting to sign in…</div>
      </PublicShell>
    );
  if (mode === "edit" && !task)
    return (
      <State
        title="Task not found"
        body="This task cannot be loaded for editing."
        href="/tasks/browse"
        label="Browse Tasks"
      />
    );
  if (mode === "edit" && task && !editable)
    return (
      <State
        title="You cannot edit this task"
        body={
          task.status !== "open"
            ? "Only open tasks can be edited in the current lifecycle."
            : "The current signed-in account does not own this task."
        }
        href={`/tasks/${task.slug}`}
        label="Return to Task Details"
      />
    );
  return (
    <PublicShell>
      <div className="task-author">
        <div className="page-container">
          <header>
            <p className="section-kicker">Task &amp; Soft Skills Marketplace</p>
            <h1>
              {mode === "create" ? "Post a focused task" : "Edit your task"}
            </h1>
            <p>
              {mode === "create"
                ? "Describe one specific problem and the outcome you need."
                : `Editing ${task?.title}`}
            </p>
            {mode === "edit" && task && (
              <p className="task-author-status">
                Current status:{" "}
                <strong>{task.status.replaceAll("-", " ")}</strong>
              </p>
            )}
          </header>
          {Object.keys(errors).length > 0 && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              className="task-error-summary"
              role="alert"
            >
              <h2>Review these details</h2>
              <ul>
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>
                    <a href={`#${key}`}>{message}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              void save(mode === "create" ? "publish" : "changes");
            }}
            noValidate
          >
            <section>
              <h2>Basic details</h2>
              <Field id="title" label="Task title" error={errors.title}>
                <input
                  id="title"
                  maxLength={100}
                  value={state.title}
                  onChange={(event) => set("title", event.target.value)}
                />
              </Field>
              <div className="task-category-picker">
                <Field id="category-search" label="Find a category">
                  <input
                    id="category-search"
                    value={categorySearch}
                    onChange={(event) => setCategorySearch(event.target.value)}
                    placeholder="Search 40 categories"
                  />
                </Field>
                <Field
                  id="categoryId"
                  label="Task category"
                  error={errors.categoryId}
                >
                  <select
                    id="categoryId"
                    value={state.categoryId}
                    onChange={(event) => selectCategory(event.target.value)}
                  >
                    <option value="">Choose a category</option>
                    {taskAuthoringGroups.map((group) => (
                      <optgroup key={group} label={group}>
                        {filtered
                          .filter((item) => item.group === group)
                          .map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.label}
                            </option>
                          ))}
                      </optgroup>
                    ))}
                    <optgroup label="Other">
                      <option value="custom">Other / Custom Task</option>
                    </optgroup>
                  </select>
                </Field>
              </div>
              {state.categoryId === "custom" && (
                <Field
                  id="customCategoryName"
                  label="Custom category name"
                  error={errors.customCategoryName}
                >
                  <input
                    id="customCategoryName"
                    value={state.customCategoryName}
                    onChange={(event) =>
                      set("customCategoryName", event.target.value)
                    }
                  />
                </Field>
              )}
              <Field
                id="description"
                label="Description"
                error={errors.description}
                help="Explain the current situation, problem, context, and what needs to be done."
              >
                <textarea
                  id="description"
                  rows={7}
                  value={state.description}
                  onChange={(event) => set("description", event.target.value)}
                />
              </Field>
            </section>
            <section>
              <h2>Skills and requirements</h2>
              <Field
                id="skills"
                label="Required skills"
                error={errors.skills}
                help="Add only skills directly relevant to this task."
              >
                <div className="task-skill-entry">
                  <input
                    id="skills"
                    value={skillDraft}
                    onChange={(event) => setSkillDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === ",") {
                        event.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <button type="button" onClick={addSkill}>
                    Add skill
                  </button>
                </div>
                <div className="task-author-tags">
                  {state.skills.map((skill) => (
                    <span key={skill}>
                      {skill}
                      <button
                        type="button"
                        aria-label={`Remove ${skill}`}
                        onClick={() =>
                          set(
                            "skills",
                            state.skills.filter((value) => value !== skill),
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </Field>
              <Field
                id="expectedDeliverable"
                label="Expected output"
                error={errors.expectedDeliverable}
                help="What should the solver send when the task is complete?"
              >
                <textarea
                  id="expectedDeliverable"
                  rows={4}
                  value={state.expectedDeliverable}
                  onChange={(event) =>
                    set("expectedDeliverable", event.target.value)
                  }
                />
              </Field>
              <div className="task-form-row">
                <Field id="experience" label="Experience level">
                  <select
                    id="experience"
                    value={state.experience}
                    onChange={(event) =>
                      set("experience", event.target.value as TaskExperience)
                    }
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Expert</option>
                  </select>
                </Field>
                <Field
                  id="capability"
                  label="Necessary experience / capability"
                  error={errors.capability}
                >
                  <textarea
                    id="capability"
                    rows={3}
                    value={state.capability}
                    onChange={(event) => set("capability", event.target.value)}
                  />
                </Field>
              </div>
            </section>
            {category && (
              <section>
                <h2>{category.label} details</h2>
                <p>Only fields relevant to the selected category are shown.</p>
                <div className="task-specialized-grid">
                  {category.fields.map((field) => (
                    <Field
                      key={field.id}
                      id={`category-${field.id}`}
                      label={field.label}
                      error={errors[`category-${field.id}`]}
                    >
                      {field.type === "textarea" ? (
                        <textarea
                          id={`category-${field.id}`}
                          rows={3}
                          value={state.categoryFields[field.id] ?? ""}
                          onChange={(event) =>
                            set("categoryFields", {
                              ...state.categoryFields,
                              [field.id]: event.target.value,
                            })
                          }
                        />
                      ) : field.type === "boolean" ? (
                        <select
                          id={`category-${field.id}`}
                          value={state.categoryFields[field.id] ?? ""}
                          onChange={(event) =>
                            set("categoryFields", {
                              ...state.categoryFields,
                              [field.id]: event.target.value,
                            })
                          }
                        >
                          <option value="">Choose</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      ) : (
                        <input
                          id={`category-${field.id}`}
                          value={state.categoryFields[field.id] ?? ""}
                          onChange={(event) =>
                            set("categoryFields", {
                              ...state.categoryFields,
                              [field.id]: event.target.value,
                            })
                          }
                        />
                      )}
                    </Field>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2>Scope and submission</h2>
              <div className="task-form-row">
                <Field
                  id="deadline"
                  label="Task deadline"
                  error={errors.deadline}
                >
                  <input
                    id="deadline"
                    type="date"
                    min="2026-11-05"
                    value={state.deadline}
                    onChange={(event) => set("deadline", event.target.value)}
                  />
                </Field>
                <Field id="duration" label="Estimated duration">
                  <select
                    id="duration"
                    value={state.duration}
                    onChange={(event) =>
                      set("duration", event.target.value as TaskDuration)
                    }
                  >
                    <option>A few hours</option>
                    <option>Less than a day</option>
                    <option>1–3 days</option>
                    <option>About a week</option>
                  </select>
                </Field>
              </div>
              <Field
                id="submissionExpectation"
                label="Submission expectations"
                error={errors.submissionExpectation}
              >
                <textarea
                  id="submissionExpectation"
                  rows={4}
                  value={state.submissionExpectation}
                  onChange={(event) =>
                    set("submissionExpectation", event.target.value)
                  }
                />
              </Field>
              <div className="task-file-stage">
                <label htmlFor="attachments">Supporting material</label>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(event) =>
                    setFiles(
                      Array.from(event.target.files ?? []).map(
                        (file) => file.name,
                      ),
                    )
                  }
                />
                <p>
                  Files are staged only for this page and are not uploaded or
                  persisted.
                </p>
                {files.length > 0 && (
                  <ul>
                    {files.map((file) => (
                      <li key={file}>{file}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
            <section>
              <h2>Compensation</h2>
              <div className="task-compensation-row">
                <Field id="budgetType" label="Budget type">
                  <select
                    id="budgetType"
                    value={state.budgetType}
                    onChange={(event) =>
                      set("budgetType", event.target.value as TaskBudgetType)
                    }
                  >
                    <option>Fixed price</option>
                    <option>Hourly</option>
                  </select>
                </Field>
                <Field id="budget" label="Amount (PKR)" error={errors.budget}>
                  <input
                    id="budget"
                    inputMode="numeric"
                    value={state.budget}
                    onChange={(event) => set("budget", event.target.value)}
                  />
                </Field>
                <Field id="currency" label="Currency">
                  <input id="currency" value="PKR" readOnly />
                </Field>
              </div>
              <Field id="compensationConditions" label="Relevant conditions">
                <textarea
                  id="compensationConditions"
                  rows={3}
                  value={state.compensationConditions}
                  onChange={(event) =>
                    set("compensationConditions", event.target.value)
                  }
                />
              </Field>
            </section>
            <div className="task-author-actions">
              {mode === "create" && (
                <button
                  className="button button--secondary"
                  type="button"
                  disabled={busy}
                  onClick={() => void save("draft")}
                >
                  {busy ? "Saving…" : "Save Draft"}
                </button>
              )}
              <button
                className="button button--secondary"
                type="button"
                onClick={preview}
              >
                Preview Task
              </button>
              <button
                className="button button--primary"
                type="submit"
                disabled={busy}
              >
                {busy
                  ? "Saving…"
                  : mode === "create"
                    ? "Publish Task"
                    : "Save Changes"}
              </button>
              <button className="task-cancel" type="button" onClick={cancel}>
                Cancel
              </button>
              {mode === "edit" && task?.status === "open" && (
                <button
                  className="task-close"
                  type="button"
                  onClick={() => closeRef.current?.showModal()}
                >
                  Close Task
                </button>
              )}
            </div>
          </form>
          {notice && (
            <div role="status" className="task-author-notice">
              {notice}
            </div>
          )}
          <dialog ref={previewRef} className="task-preview-dialog">
            <div className="task-preview-head">
              <div>
                <p className="section-kicker">Unsaved preview</p>
                <h2>How this task will appear</h2>
              </div>
              <button
                type="button"
                onClick={() => previewRef.current?.close()}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <h3>Task card</h3>
            <TaskCard task={previewTask} />
            <div className="task-full-preview">
              <h3>Full detail preview</h3>
              <p className="section-kicker">
                {previewTask.category} · {state.experience}
              </p>
              <h2>{previewTask.title}</h2>
              <p>{previewTask.description}</p>
              <dl>
                <div>
                  <dt>Expected deliverable</dt>
                  <dd>{previewTask.expectedDeliverable}</dd>
                </div>
                <div>
                  <dt>Deadline</dt>
                  <dd>{previewTask.deadline}</dd>
                </div>
                <div>
                  <dt>Compensation</dt>
                  <dd>
                    PKR {previewTask.budget.toLocaleString()} ·{" "}
                    {state.budgetType}
                  </dd>
                </div>
                <div>
                  <dt>Submission</dt>
                  <dd>{previewTask.submissionExpectation}</dd>
                </div>
              </dl>
              {category && (
                <ul>
                  {category.fields
                    .filter((field) => state.categoryFields[field.id])
                    .map((field) => (
                      <li key={field.id}>
                        <strong>{field.label}:</strong>{" "}
                        {state.categoryFields[field.id]}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </dialog>
          <dialog ref={discardRef} className="task-confirm-dialog">
            <h2>Discard unsaved changes?</h2>
            <p>Your changes have not been saved in this browser.</p>
            <div>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => discardRef.current?.close()}
              >
                Keep editing
              </button>
              <button
                className="button button--danger"
                type="button"
                onClick={() =>
                  router.push(
                    mode === "edit" && task ? `/tasks/${task.slug}` : "/tasks",
                  )
                }
              >
                Discard changes
              </button>
            </div>
          </dialog>
          <dialog ref={closeRef} className="task-confirm-dialog">
            <h2>Close this task?</h2>
            <p>
              Closing stops normal new proposals. This browser-local change
              cannot be undone from this page.
            </p>
            <div>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => closeRef.current?.close()}
              >
                Cancel
              </button>
              <button
                className="button button--danger"
                type="button"
                onClick={() => {
                  if (task && session) {
                    if (!findAuthoredTask(task.id)) {
                      const value = record("open");
                      if (value) saveAuthoredTask(value);
                    }
                    if (closeAuthoredTask(task.id, session.email))
                      router.push(`/tasks/${task.slug}`);
                  }
                }}
              >
                Confirm closure
              </button>
            </div>
          </dialog>
          <dialog ref={categoryRef} className="task-confirm-dialog">
            <h2>Change task category?</h2>
            <p>
              Category-specific details already entered will be cleared because
              the next category uses different fields.
            </p>
            <div>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => categoryRef.current?.close()}
              >
                Keep current category
              </button>
              <button
                className="button button--danger"
                type="button"
                onClick={() => {
                  setState((current) => ({
                    ...current,
                    categoryId: pendingCategory,
                    categoryFields: {},
                  }));
                  setPendingCategory("");
                  categoryRef.current?.close();
                }}
              >
                Change and clear details
              </button>
            </div>
          </dialog>
        </div>
      </div>
    </PublicShell>
  );
}
function Field({
  id,
  label,
  error,
  help,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  help?: string;
  children: ReactNode;
}) {
  return (
    <div className={`task-author-field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {help && <p>{help}</p>}
      {error && (
        <p id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
function State({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <PublicShell>
      <div className="page-container task-author-state">
        <p className="section-kicker">Task authoring</p>
        <h1>{title}</h1>
        <p>{body}</p>
        <Link className="button button--primary" href={href}>
          {label}
        </Link>
      </div>
    </PublicShell>
  );
}
