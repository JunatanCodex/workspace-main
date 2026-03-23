export function AlertBanner({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] p-4">
      <div className="text-sm font-medium text-amber-200">{title}</div>
      <div className="mt-1 text-sm text-amber-100/80">{description}</div>
    </div>
  );
}
