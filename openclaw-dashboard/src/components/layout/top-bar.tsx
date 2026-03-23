import { RefreshControl } from "@/components/ui/refresh-control";

export function TopBar() {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/6 pb-4">
      <div>
        <div className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Control plane</div>
        <div className="mt-1 text-sm text-zinc-400">Auto-refresh, live status, and operational controls.</div>
      </div>
      <RefreshControl />
    </div>
  );
}
