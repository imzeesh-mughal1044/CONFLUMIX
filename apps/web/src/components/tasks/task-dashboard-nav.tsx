"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Account overview", "/dashboard"],
  ["My Posted Tasks", "/dashboard/tasks/posted"],
  ["My Proposals", "/dashboard/tasks/proposals"],
] as const;

export function TaskDashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="task-dashboard-nav" aria-label="Personal dashboard">
      {links.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className={pathname === href ? "is-active" : ""}
          aria-current={pathname === href ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
