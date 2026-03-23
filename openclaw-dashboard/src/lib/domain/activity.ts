import { getDashboardRecentActivity } from "@/lib/db/dashboard";

export async function getRecentActivity(limit = 12) {
  return getDashboardRecentActivity(limit);
}
