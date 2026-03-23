import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/guard";
import { getDashboardTasks } from "@/lib/db/tasks";

export async function GET() {
  await requireAuthenticatedUser();
  const tasks = await getDashboardTasks();
  return NextResponse.json({ tasks, updatedAt: new Date().toISOString() });
}
