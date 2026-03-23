import { PageShell } from "@/components/layout/page-shell";
import { ManualActionPanel } from "@/components/forms/manual-action-panel";

export default function ActionsPage() {
  return (
    <PageShell title="Manual control" description="Action surface for fleet control. This pass intentionally ships safe placeholders before wiring runtime execution.">
      <ManualActionPanel />
    </PageShell>
  );
}
