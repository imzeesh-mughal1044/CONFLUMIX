import type { Metadata } from "next";
import { PostedTasksPage } from "@/components/tasks/posted-tasks-page";

export const metadata: Metadata = { title: "My Posted Tasks" };
export default function Page() {
  return <PostedTasksPage />;
}
