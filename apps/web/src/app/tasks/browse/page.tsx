import { Suspense } from "react";
import { TaskBrowser } from "@/components/tasks/task-browser";
export default function BrowseTasksPage(){return <Suspense fallback={<div className="route-loading">Loading tasks…</div>}><TaskBrowser/></Suspense>}
