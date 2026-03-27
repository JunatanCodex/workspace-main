type Point = { label: string; deployments: number; incidents: number };

export function TrendChart({ points }: { points: Point[] }) {
  const max = Math.max(1, ...points.flatMap((p) => [p.deployments, p.incidents]));
  return (
    <div className="space-y-3">
      {points.map((point) => (
        <div key={point.label} className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{point.label}</span>
            <span>{point.deployments} deploys · {point.incidents} incidents</span>
          </div>
          <div className="space-y-2">
            <div className="h-2 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full bg-emerald-500/80" style={{ width: `${(point.deployments / max) * 100}%` }} /></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/6"><div className="h-full rounded-full bg-amber-500/80" style={{ width: `${(point.incidents / max) * 100}%` }} /></div>
          </div>
        </div>
      ))}
      {!points.length ? <div className="text-sm text-zinc-500">No historical trend data yet.</div> : null}
    </div>
  );
}
