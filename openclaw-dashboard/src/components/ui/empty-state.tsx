export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950/70 p-8 text-center">
      <div className="text-sm font-medium text-zinc-200">{title}</div>
      <div className="mt-2 text-sm text-zinc-500">{description}</div>
    </div>
  );
}
