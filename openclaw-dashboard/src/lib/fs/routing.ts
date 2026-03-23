import { ROUTING_FILE } from "@/lib/config";
import { readJsonIfExists } from "./safe-read";

export interface RoutingMap {
  version?: number;
  updatedAt?: string;
  routes?: Record<string, string>;
  fallback?: string;
  priorityRules?: Record<string, string>;
}

export async function getRoutingMap(): Promise<RoutingMap> {
  return readJsonIfExists<RoutingMap>(ROUTING_FILE, { routes: {} });
}
