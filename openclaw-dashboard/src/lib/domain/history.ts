import { getDashboardHistoryMetrics } from "@/lib/db/dashboard";

export async function getHistoryMetrics() {
  return getDashboardHistoryMetrics();
}
