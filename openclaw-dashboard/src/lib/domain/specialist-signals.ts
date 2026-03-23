import type { AgentDetails } from "@/lib/types";

export interface SpecialistSignal {
  agentId: string;
  title: string;
  summary: string;
  href: string;
}

function pickSignal(agent: AgentDetails | undefined, fallback: string, title: string): SpecialistSignal | null {
  if (!agent) return null;
  const summary = agent.suggestedOutputFiles[0]?.name || agent.latestOutputFile?.name || agent.summary || fallback;
  return {
    agentId: agent.id,
    title,
    summary,
    href: `/agents/${agent.id}`,
  };
}

export function getSpecialistSignals(agents: AgentDetails[]): SpecialistSignal[] {
  return [
    pickSignal(agents.find((agent) => agent.id === "lead-developer"), "No architecture decision artifact yet.", "Architecture signal"),
    pickSignal(agents.find((agent) => agent.id === "debugger-agent"), "No root-cause report yet.", "Debugging signal"),
    pickSignal(agents.find((agent) => agent.id === "validation-agent"), "No validation verdict yet.", "Validation signal"),
    pickSignal(agents.find((agent) => agent.id === "freelancing-optimizer"), "No offer or pricing draft yet.", "Freelancing signal"),
    pickSignal(agents.find((agent) => agent.id === "docs-agent"), "No docs/release update yet.", "Documentation signal"),
  ].filter((value): value is SpecialistSignal => Boolean(value));
}
