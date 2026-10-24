import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account access" };

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
