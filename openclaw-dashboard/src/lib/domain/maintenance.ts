import { getSharedEvents, type SharedEventRecord } from "@/lib/fs/events";

export interface MaintenanceEvent extends SharedEventRecord {
  category: "cleanup" | "automation" | "pipeline" | "system";
}

function categorizeEvent(event: SharedEventRecord): MaintenanceEvent["category"] {
  const action = String(event.action_taken || "").toLowerCase();
  const type = String(event.event_type || "").toLowerCase();

  if (action.includes("cancelled_duplicate") || action.includes("cleanup") || action.includes("prune")) return "cleanup";
  if (type.includes("pipeline") || action.includes("pipeline")) return "pipeline";
  if (type.includes("automation") || action.includes("auto-") || action.includes("automation")) return "automation";
  return "system";
}

export async function getMaintenanceEvents(limit = 50): Promise<MaintenanceEvent[]> {
  const events = await getSharedEvents();

  return events
    .map((event) => ({ ...event, category: categorizeEvent(event) }))
    .sort((a, b) => String(b.timestamp || "").localeCompare(String(a.timestamp || "")))
    .slice(0, limit);
}

export async function getMaintenanceSummary() {
  const events = await getMaintenanceEvents(200);
  const cleanupEvents = events.filter((event) => event.category === "cleanup");
  const automationEvents = events.filter((event) => event.category === "automation");
  const pipelineEvents = events.filter((event) => event.category === "pipeline");
  const latest = events[0];

  return {
    total: events.length,
    cleanup: cleanupEvents.length,
    automation: automationEvents.length,
    pipeline: pipelineEvents.length,
    latestAt: latest?.timestamp,
  };
}
