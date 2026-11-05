import type { AuthoredTask, TaskDetail } from "@/types/tasks";
const key = "conflumix.tasks.authored.v1";
export const taskAuthoringEvent = "conflumix-task-authoring";
export function readAuthoredTasks(): AuthoredTask[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}
function write(records: AuthoredTask[]) {
  localStorage.setItem(key, JSON.stringify(records));
  window.dispatchEvent(new Event(taskAuthoringEvent));
}
export function saveAuthoredTask(task: AuthoredTask) {
  const records = readAuthoredTasks(),
    index = records.findIndex((item) => item.id === task.id);
  if (index >= 0) records[index] = task;
  else records.unshift(task);
  write(records);
  return task;
}
export function findAuthoredTask(identifier: string) {
  const safe = identifier.toLowerCase();
  return readAuthoredTasks().find(
    (item) =>
      item.id.toLowerCase() === safe || item.slug.toLowerCase() === safe,
  );
}
export function publicAuthoredTasks(): TaskDetail[] {
  return readAuthoredTasks().flatMap((item) =>
    item.status === "draft"
      ? []
      : [{ ...item, status: item.status } satisfies TaskDetail],
  );
}
export function closeAuthoredTask(id: string, ownerEmail: string) {
  const record = readAuthoredTasks().find((item) => item.id === id);
  if (!record || record.ownerEmail !== ownerEmail || record.status !== "open")
    return false;
  saveAuthoredTask({
    ...record,
    status: "closed",
    updatedAt: new Date().toISOString(),
  });
  return true;
}
export function slugifyTask(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 70) || "task"
  );
}
