import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/command/command-palette";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenClaw Dashboard",
  description: "Local dashboard for monitoring OpenClaw agents, tasks, and outputs.",
};

const commandItems = [
  { label: "Overview", href: "/" },
  { label: "Agents", href: "/agents" },
  { label: "Tasks", href: "/tasks" },
  { label: "Business Pipeline", href: "/business-pipeline" },
  { label: "Developer Pipeline", href: "/developer-pipeline" },
  { label: "Alerts", href: "/alerts" },
  { label: "Outputs", href: "/outputs" },
  { label: "Manual Control", href: "/actions" },
  { label: "Runtime Logs", href: "/runtime-logs" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full`}>
      <body className="min-h-full bg-[#07070a] text-zinc-100 antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.06),transparent_18%)] lg:flex">
          <Sidebar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
          <CommandPalette items={commandItems} />
        </div>
      </body>
    </html>
  );
}
