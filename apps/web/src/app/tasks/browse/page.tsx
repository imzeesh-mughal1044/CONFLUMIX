import { Suspense } from "react";
import { TaskBrowser } from "@/components/tasks/task-browser";
import {PageLoadingState} from "@/components/system/async-state";
export default function BrowseTasksPage(){return <Suspense fallback={<PageLoadingState label="Loading tasks" kind="task"/>}><TaskBrowser/></Suspense>}
