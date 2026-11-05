import { tasks } from "@/data/tasks";
import type { TaskDetail, TaskOpportunity, TaskQuery } from "@/types/tasks";
import { publicAuthoredTasks } from "./task-authoring";

const TODAY = new Date("2026-11-04T00:00:00Z");
export function isOpenTask(task: TaskOpportunity) {
  return task.status === "open" && new Date(task.deadline) >= TODAY;
}
export function browseTasks(query: TaskQuery): TaskOpportunity[] {
  const search = query.q?.trim().toLowerCase();
  const local = publicAuthoredTasks();
  const catalogue = [
    ...local,
    ...tasks.filter((task) => !local.some((item) => item.id === task.id)),
  ];
  return catalogue
    .filter((task) => {
      const text = [
        task.title,
        task.description,
        task.category,
        task.owner,
        ...task.skills,
      ]
        .join(" ")
        .toLowerCase();
      const days = Math.ceil(
        (new Date(task.deadline).getTime() - TODAY.getTime()) / 86400000,
      );
      return (
        (!search || text.includes(search)) &&
        (!query.category || task.category === query.category) &&
        (!query.skills?.length ||
          query.skills.every((skill) =>
            task.skills.some(
              (value) => value.toLowerCase() === skill.toLowerCase(),
            ),
          )) &&
        (!query.status || task.status === query.status) &&
        (!query.budget ||
          (query.budget === "under-5000"
            ? task.budget < 5000
            : query.budget === "5000-10000"
              ? task.budget >= 5000 && task.budget <= 10000
              : task.budget > 10000)) &&
        (!query.deadline ||
          (query.deadline === "7-days"
            ? days >= 0 && days <= 7
            : query.deadline === "30-days"
              ? days >= 0 && days <= 30
              : days > 30)) &&
        (!query.arrangement ||
          task.arrangement.toLowerCase() === query.arrangement) &&
        (!query.locality ||
          task.locality.toLowerCase() === query.locality.toLowerCase())
      );
    })
    .sort((a, b) =>
      query.sort === "deadline"
        ? a.deadline.localeCompare(b.deadline) || a.id.localeCompare(b.id)
        : query.sort === "budget-high"
          ? b.budget - a.budget || a.id.localeCompare(b.id)
          : query.sort === "budget-low"
            ? a.budget - b.budget || a.id.localeCompare(b.id)
            : b.createdAt.localeCompare(a.createdAt) ||
              a.id.localeCompare(b.id),
    );
}
export const taskSkills = Array.from(
  new Set(tasks.flatMap((task) => task.skills)),
).sort();
export const taskLocalities = Array.from(
  new Set(tasks.map((task) => task.locality)),
).sort();
const briefByCategory: Record<
  TaskOpportunity["category"],
  Pick<
    TaskDetail,
    "expectedDeliverable" | "requirements" | "submissionExpectation"
  >
> = {
  Design: {
    expectedDeliverable:
      "Editable source files plus final, presentation-ready exports.",
    requirements: [
      "Follow the dimensions and visual references supplied by the owner.",
      "Keep all text and graphic elements editable.",
    ],
    submissionExpectation:
      "Provide the editable source file and exported PNG or PDF files.",
  },
  Writing: {
    expectedDeliverable:
      "A polished final document that preserves the intended meaning and voice.",
    requirements: [
      "Use clear, concise language and retain all factual details.",
      "Apply consistent headings, spelling, and punctuation.",
    ],
    submissionExpectation:
      "Provide an editable document and a clean final copy.",
  },
  Programming: {
    expectedDeliverable:
      "Working corrected code with a concise explanation of the changes.",
    requirements: [
      "Limit changes to the described problem and preserve existing behavior.",
      "Identify the cause of the issue and document how the fix was verified.",
    ],
    submissionExpectation:
      "Provide the updated source files and a short written change summary.",
  },
  "Data Analysis": {
    expectedDeliverable:
      "A cleaned or analyzed dataset with a concise summary of the work completed.",
    requirements: [
      "Preserve the original source data in a separate copy.",
      "Document transformations and clearly label any charts or summary tables.",
    ],
    submissionExpectation:
      "Provide the working spreadsheet or dataset and a brief findings note.",
  },
  Research: {
    expectedDeliverable:
      "A focused, source-linked research summary covering the requested scope.",
    requirements: [
      "Use current, traceable sources and distinguish facts from interpretation.",
      "Keep the comparison concise and within the requested topic.",
    ],
    submissionExpectation:
      "Provide an editable document with working source links.",
  },
  "Office and Digital Support": {
    expectedDeliverable:
      "An organized, consistently formatted set of digital files ready for use.",
    requirements: [
      "Follow the supplied naming or formatting convention.",
      "Do not remove source material; flag unclear items for owner review.",
    ],
    submissionExpectation:
      "Provide the completed files and a short index or change note.",
  },
};
export function findTask(identifier: string): TaskDetail | undefined {
  let safe = identifier;
  try {
    safe = decodeURIComponent(identifier);
  } catch {
    return undefined;
  }
  safe = safe.trim().toLowerCase();
  const local = publicAuthoredTasks().find(
    (item) =>
      item.id.toLowerCase() === safe || item.slug.toLowerCase() === safe,
  );
  if (local) return local;
  const task = tasks.find(
    (item) =>
      item.id.toLowerCase() === safe || item.slug.toLowerCase() === safe,
  );
  return task ? { ...task, ...briefByCategory[task.category] } : undefined;
}
