import type { Metadata } from "next";
import { HomePage } from "@/components/public/home-page";

export const metadata: Metadata = { title: "Local exchange, connected", description: "Explore new products, reuse, tasks, and community resources through one connected local marketplace." };
export default function Home() { return <HomePage/>; }
