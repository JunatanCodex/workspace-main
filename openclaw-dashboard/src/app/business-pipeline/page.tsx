import { PageShell } from "@/components/layout/page-shell";
import { getBusinessPipeline } from "@/lib/domain/pipelines";

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
      <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>No items yet.</li>}
      </ul>
    </div>
  );
}

export default async function BusinessPipelinePage() {
  const pipeline = await getBusinessPipeline();
  return (
    <PageShell title="Business pipeline" description="Cross-agent business pipeline view connecting niche discovery, validation, fact checks, and monetization outputs.">
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Section title="Niches discovered" items={pipeline.nichesDiscovered} />
        <Section title="Ideas validated" items={pipeline.ideasValidated} />
        <Section title="Fact checks completed" items={pipeline.factChecksCompleted} />
        <Section title="Gigs created" items={pipeline.gigsCreated} />
        <Section title="Opportunities ready to build" items={pipeline.opportunitiesReadyToBuild} />
        <Section title="Opportunities ready to pitch" items={pipeline.opportunitiesReadyToPitch} />
      </div>
    </PageShell>
  );
}
