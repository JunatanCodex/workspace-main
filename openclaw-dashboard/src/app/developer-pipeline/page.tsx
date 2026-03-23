import { PageShell } from "@/components/layout/page-shell";
import { getDeveloperPipeline } from "@/lib/domain/pipelines";

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

export default async function DeveloperPipelinePage() {
  const pipeline = await getDeveloperPipeline();
  return (
    <PageShell title="Developer pipeline" description="Cross-agent engineering pipeline view connecting architecture, planning, implementation, review, debugging, and ops.">
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Section title="Architecture decisions" items={pipeline.architectureDecisions} />
        <Section title="Feature plans" items={pipeline.featurePlans} />
        <Section title="Code tasks in progress" items={pipeline.codeTasksInProgress} />
        <Section title="Pending reviews" items={pipeline.pendingReviews} />
        <Section title="Active issues" items={pipeline.activeIssues} />
        <Section title="Infra warnings" items={pipeline.infraWarnings} />
      </div>
    </PageShell>
  );
}
