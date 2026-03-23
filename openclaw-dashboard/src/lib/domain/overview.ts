import { getDashboardOverviewStats } from "@/lib/db/dashboard";

export async function getOverviewStats() {
  return getDashboardOverviewStats();
}
