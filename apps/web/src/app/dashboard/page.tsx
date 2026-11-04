import type { Metadata } from "next";
import { PersonalDashboardPage } from "@/components/public/personal-dashboard-page";

export const metadata: Metadata = { title: "Personal Dashboard" };

export default function DashboardPage() {
  return <PersonalDashboardPage/>;
}
