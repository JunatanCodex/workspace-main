import { NextRequest, NextResponse } from "next/server";
import { runQueueHygiene } from "@/lib/fs/task-hygiene";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = String(body.action || '') as 'cancel-stale-approval' | 'cancel-superseded-failed' | 'requeue-stalled';
  if (!action) return NextResponse.json({ ok: false, error: 'action is required.' }, { status: 400 });
  const changed = await runQueueHygiene(action);
  return NextResponse.json({ ok: true, changed, message: `${action} updated ${changed} task(s).` });
}
