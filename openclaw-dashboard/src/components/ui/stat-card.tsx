export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm transition hover:border-white/12 hover:bg-zinc-950">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">{label}</div>
      <div className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50">{value}</div>
      {hint ? <div className="mt-2 text-sm text-zinc-500">{hint}</div> : null}
    </div>
  );
}
