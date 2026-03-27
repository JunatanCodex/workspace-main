import { PremiumMetric } from "@/components/ui/premium";

export function MetricsPanels({ deployments, incidents, healthy, attention }: { deployments: number; incidents: number; healthy: number; attention: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <PremiumMetric label="Incidents" value={incidents} subtext="Tracked incident records" />
      <PremiumMetric label="Deployments" value={deployments} subtext="Recorded deployment events" />
      <PremiumMetric label="Healthy now" value={healthy} subtext="Bots reporting healthy" />
      <PremiumMetric label="Need attention" value={attention} subtext="Failed or degraded bots" />
    </div>
  );
}
