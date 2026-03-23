import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { PipelineDefinitionEditor } from "@/components/pipelines/pipeline-definition-editor";
import { getPipelineControlView } from "@/lib/pipelines/view";
import { rerunPipelineAction, togglePipelineAutoRunAction, togglePipelineEnabledAction } from "@/lib/actions/pipelines";

export default async function PipelinesPage() {
  const pipelines = await getPipelineControlView();
  return (
    <PageShell title="Pipelines" description="Stage-based premium pipeline control center for development and business workflows. File-driven, local, and safe first.">
      <div className="space-y-6">
        {pipelines.length === 0 ? (
          <EmptyState title="No pipelines defined" description="Create your first local pipeline definition below." />
        ) : pipelines.map((pipeline) => (
          <section key={pipeline.id} className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
            <SectionHeader title={pipeline.name} description={`${pipeline.kind} pipeline · ${pipeline.steps.length} stages`} />
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <StatusBadge value={pipeline.enabled ? "running" : "idle"} />
              <span className="text-sm text-zinc-400">Auto-run: {pipeline.autoRun ? "enabled" : "disabled"}</span>
              {pipeline.approvalGates?.length ? <span className="text-sm text-zinc-400">Approval gates: {pipeline.approvalGates.join(", ")}</span> : null}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {pipeline.steps.map((step) => (
                <div key={`${pipeline.id}-${step.index}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-zinc-100">{step.label}</div>
                      <div className="mt-1 text-sm text-zinc-500">{step.agentName} · condition: {step.condition || "always"}</div>
                    </div>
                    <StatusBadge value={step.status} />
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
                    <div>Pending tasks: {step.pendingTasks}</div>
                    <div>Latest output: {step.latestOutput || "None"}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <form action={togglePipelineEnabledAction}><input type="hidden" name="pipelineId" value={pipeline.id} /><button type="submit" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">{pipeline.enabled ? "Disable" : "Enable"}</button></form>
              <form action={togglePipelineAutoRunAction}><input type="hidden" name="pipelineId" value={pipeline.id} /><button type="submit" className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.06]">{pipeline.autoRun ? "Disable auto-run" : "Enable auto-run"}</button></form>
              <form action={rerunPipelineAction}><input type="hidden" name="pipelineId" value={pipeline.id} /><button type="submit" className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900">Rerun pipeline</button></form>
            </div>
          </section>
        ))}
        <PipelineDefinitionEditor />
      </div>
    </PageShell>
  );
}
