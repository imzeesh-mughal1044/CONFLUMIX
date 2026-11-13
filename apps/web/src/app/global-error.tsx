"use client";
import {SystemStatePage} from "@/components/system/system-state-page";
export default function GlobalError({reset}:{reset:()=>void}){return <html lang="en"><body><SystemStatePage kind="error" onRetry={reset}/></body></html>}
