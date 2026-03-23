export function ManualActionPanel() {
  const actions = [
    ["Trigger orchestrator", "Stub only in this version"],
    ["Trigger agent manually", "Stub only in this version"],
    ["Create task", "Next phase: real file-backed action"],
    ["Requeue task", "Next phase: real file-backed action"],
    ["Mark for approval review", "Next phase: real file-backed action"],
    ["Open workspace path", "UI placeholder; OS integration not wired"],
  ];

  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold text-zinc-50">Manual control</h2>
      <p className="mt-2 text-sm text-zinc-400">
        Safe placeholders first. These are visible in the UI so control paths are designed up front, but they are intentionally not pretending to execute live runtime actions yet.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {actions.map(([label, note]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="font-medium text-zinc-100">{label}</div>
            <div className="mt-1 text-sm text-zinc-500">{note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
