import { PageShell } from "@/components/layout/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { PipelineStage } from "@/components/pipelines/pipeline-stage";
import { getBusinessPipeline } from "@/lib/domain/pipelines";

function stageStatus(items: string[]) {
  return items.length ? "running" : "idle";
}

export default async function BusinessPipelinePage() {
  const pipeline = await getBusinessPipeline();
  return (
    <PageShell title="Business pipeline" description="A GitHub-Actions-style business flow from opportunity discovery to pitch-ready monetization.">
      <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
        <SectionHeader title="Pipeline stages" description="Discovery, validation, verification, and pitch readiness in one place." />
        <div className="grid gap-4 xl:grid-cols-2">
          <PipelineStage title="Niche discovery" items={pipeline.nichesDiscovered} status={stageStatus(pipeline.nichesDiscovered)} href="/agents/niche-scout" />
          <PipelineStage title="Idea validation" items={pipeline.ideasValidated} status={stageStatus(pipeline.ideasValidated)} href="/agents/validation-agent" />
          <PipelineStage title="Fact checking" items={pipeline.factChecksCompleted} status={stageStatus(pipeline.factChecksCompleted)} href="/agents/fact-checker" />
          <PipelineStage title="Gig creation" items={pipeline.gigsCreated} status={stageStatus(pipeline.gigsCreated)} href="/agents/freelancing-optimizer" />
          <PipelineStage title="Ready to build" items={pipeline.opportunitiesReadyToBuild} status={stageStatus(pipeline.opportunitiesReadyToBuild)} href="/developer-pipeline" />
          <PipelineStage title="Ready to pitch" items={pipeline.opportunitiesReadyToPitch} status={stageStatus(pipeline.opportunitiesReadyToPitch)} href="/agents/freelancing-optimizer" />
        </div>
      </section>
    </PageShell>
  );
}
