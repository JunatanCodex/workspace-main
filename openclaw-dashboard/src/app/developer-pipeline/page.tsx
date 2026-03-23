import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { PipelineStage } from "@/components/pipelines/pipeline-stage";
import { getDeveloperPipeline } from "@/lib/domain/pipelines";

function stageStatus(items: string[]) {
  return items.length ? "running" : "idle";
}

export default async function DeveloperPipelinePage() {
  const pipeline = await getDeveloperPipeline();
  return (
    <PageShell title="Developer pipeline" description="A GitHub-Actions-style development flow from architecture to ops visibility.">
      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="Pipeline stages" description="Architecture, planning, implementation, review, debugging, and operations status in one view." />
        <div className="grid gap-4 xl:grid-cols-2">
          <PipelineStage title="Architecture decisions" items={pipeline.architectureDecisions} status={stageStatus(pipeline.architectureDecisions)} href="/agents/lead-developer" />
          <PipelineStage title="Feature plans" items={pipeline.featurePlans} status={stageStatus(pipeline.featurePlans)} href="/agents/feature-planner" />
          <PipelineStage title="Implementation in progress" items={pipeline.codeTasksInProgress} status={stageStatus(pipeline.codeTasksInProgress)} href="/agents/implementation-agent" />
          <PipelineStage title="Pending reviews" items={pipeline.pendingReviews} status={stageStatus(pipeline.pendingReviews)} href="/agents/review-agent" />
          <PipelineStage title="Active issues" items={pipeline.activeIssues} status={stageStatus(pipeline.activeIssues)} href="/agents/debugger-agent" />
          <PipelineStage title="Infra warnings" items={pipeline.infraWarnings} status={stageStatus(pipeline.infraWarnings)} href="/agents/ops-agent" />
        </div>
      </section>
    </PageShell>
  );
}
