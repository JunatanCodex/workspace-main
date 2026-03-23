import { savePipelineDefinitionAction } from "@/lib/actions/pipelines";

export function PipelineDefinitionEditor() {
  return (
    <form action={savePipelineDefinitionAction} className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
      <div className="text-lg font-semibold tracking-tight text-zinc-50">Pipeline editor</div>
      <div className="mt-2 text-sm text-zinc-400">Create or update a local file-driven pipeline definition. Steps use one line per entry in the format: <code>agentId | label | condition</code>.</div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input name="id" placeholder="pipeline-id" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
        <input name="name" placeholder="Pipeline name" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
        <input name="kind" placeholder="development | business | custom" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
        <input name="retries" type="number" min="0" defaultValue="1" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none" />
        <input name="failureBehavior" placeholder="stop | route_to_debugger | continue" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
        <input name="approvalGates" placeholder="Comma-separated approval gates" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
      </div>
      <div className="mt-4 flex gap-4 text-sm text-zinc-300">
        <label className="flex items-center gap-2"><input type="checkbox" name="enabled" value="true" className="accent-zinc-100" /> Enabled</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="autoRun" value="true" className="accent-zinc-100" /> Auto-run</label>
      </div>
      <textarea name="steps" rows={8} placeholder={"lead-developer | Architecture | always\nfeature-planner | Planning | always\nimplementation-agent | Implementation | always"} className="mt-4 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
      <button type="submit" className="mt-4 rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Save pipeline</button>
    </form>
  );
}
