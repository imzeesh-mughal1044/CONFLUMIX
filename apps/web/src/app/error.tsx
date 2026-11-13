"use client";
import {SystemStatePage} from "@/components/system/system-state-page";
export default function ErrorBoundary({reset}:{reset:()=>void}){return <SystemStatePage kind="error" onRetry={reset}/>}
