import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { CommandPalette } from "@/components/command/command-palette";
import { getAgents } from "@/lib/fs/agents";
import { getTasks, getTaskLabel } from "@/lib/fs/tasks";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenClaw Dashboard",
  description: "Local dashboard for monitoring OpenClaw agents, tasks, and outputs.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [agents, tasks] = await Promise.all([getAgents(), getTasks()]);
  const commandItems = [
    { label: "Overview", href: "/", kind: "page" },
    { label: "Agents", href: "/agents", kind: "page" },
    { label: "Tasks", href: "/tasks", kind: "page" },
    { label: "Business Pipeline", href: "/business-pipeline", kind: "page" },
    { label: "Developer Pipeline", href: "/developer-pipeline", kind: "page" },
    { label: "Alerts", href: "/alerts", kind: "page" },
    { label: "Outputs", href: "/outputs", kind: "page" },
    { label: "Manual Control", href: "/actions", kind: "action" },
    { label: "CLI Control", href: "/cli", kind: "page" },
    { label: "Runtime Logs", href: "/runtime-logs", kind: "page" },
    ...agents.map((agent) => ({ label: `Agent: ${agent.name}`, href: `/agents/${agent.id}`, kind: "agent" })),
    ...tasks.slice(0, 30).map((task, index) => ({ label: `Task: ${getTaskLabel(task)}`, href: `/tasks/${task.id || `task-${index}`}`, kind: "task" })),
  ];

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full`}>
      <body className="min-h-full bg-[#07070a] text-zinc-100 antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.06),transparent_18%)] lg:flex">
          <Sidebar />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
            <TopBar />
            {children}
          </main>
          <CommandPalette items={commandItems} />
        </div>
      </body>
    </html>
  );
}
