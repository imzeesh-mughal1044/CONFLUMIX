import type { Metadata } from "next";
import "./globals.css";
import "./public.css";

export const metadata: Metadata = {
  title: { default: "CONFLUMIX", template: "%s | CONFLUMIX" },
  description: "The multi-mode marketplace for local exchange.",
  icons: { icon: "/brand/conflumix-favicon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
