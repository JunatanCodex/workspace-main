import { EVENTS_FILE } from "@/lib/config";
import { readJsonIfExists } from "./safe-read";

export interface SharedEventRecord {
  timestamp?: string;
  event_type?: string;
  source_task_id?: string | null;
  source_agent?: string;
  action_taken?: string;
  created_task_id?: string | null;
  notes?: string;
}

interface SharedEventsDoc {
  version?: number;
  updatedAt?: string;
  events?: SharedEventRecord[];
}

export async function getSharedEvents(): Promise<SharedEventRecord[]> {
  const doc = await readJsonIfExists<SharedEventsDoc>(EVENTS_FILE, { events: [] });
  return Array.isArray(doc?.events) ? doc.events : [];
}
