import type { AgentDetails } from "@/lib/types";
import { getAgentWidgetData } from "@/lib/domain/agent-widgets";

export function AgentRoleWidgets({ agent }: { agent: AgentDetails }) {
  const widgets = getAgentWidgetData(agent);
  return (
    <div className="space-y-4">
      {widgets.map((widget) => (
        <div key={widget.title} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="text-lg font-semibold text-zinc-50">{widget.title}</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
            {widget.lines.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}
