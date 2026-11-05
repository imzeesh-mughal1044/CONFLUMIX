"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {findTask} from "@/services/tasks";
import {taskAuthoringEvent} from "@/services/task-authoring";
import type {TaskDetail} from "@/types/tasks";
import {PublicShell} from "@/components/public/public-shell";
import {TaskDetailPage} from "./task-detail-page";
export function TaskDetailRoute({identifier}:{identifier:string}){const [task,setTask]=useState<TaskDetail|undefined|null>(undefined);useEffect(()=>{const refresh=()=>setTask(findTask(identifier)??null);refresh();window.addEventListener(taskAuthoringEvent,refresh);return()=>window.removeEventListener(taskAuthoringEvent,refresh)},[identifier]);if(task===undefined)return <div className="page-container task-detail-loading"><div/><div/><div/></div>;if(!task)return <PublicShell><div className="page-container task-detail-missing"><p className="section-kicker">Task unavailable</p><h1>We couldn’t find this task.</h1><p>The link may be incorrect, or this browser does not contain the local task record.</p><Link className="button button--primary" href="/tasks/browse">Return to Browse Tasks</Link></div></PublicShell>;return <TaskDetailPage task={task}/>}
