import { NextResponse } from "next/server";
import { getTasks } from "@/lib/fs/tasks";

export async function GET() {
  const tasks = await getTasks();
  return NextResponse.json({ tasks, updatedAt: new Date().toISOString() });
}
