export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-sm">
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-zinc-50">{value}</div>
      {hint ? <div className="mt-2 text-sm text-zinc-500">{hint}</div> : null}
    </div>
  );
}
