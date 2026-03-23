export interface FleetAgentProfile {
  id: string;
  name: string;
  emoji: string;
  focus: string;
  expectedOutputs: string[];
  outputKeywords: string[];
}

export const EXPECTED_FLEET: FleetAgentProfile[] = [
  {
    id: "orchestrator",
    name: "orchestrator",
    emoji: "🧭",
    focus: "Queue activity, routing health, and digest freshness.",
    expectedOutputs: ["routing summaries", "queue updates", "daily digest"],
    outputKeywords: ["digest", "routing", "queue", "tasks"],
  },
  {
    id: "lead-developer",
    name: "lead-developer",
    emoji: "🏗️",
    focus: "Architecture decisions and technical recommendations.",
    expectedOutputs: ["architecture notes", "decision records", "technical recommendations"],
    outputKeywords: ["architecture", "decision", "adr", "recommendation"],
  },
  {
    id: "feature-planner",
    name: "feature-planner",
    emoji: "🧠",
    focus: "Planning docs, specs, and task breakdowns.",
    expectedOutputs: ["specs", "planning docs", "task breakdowns"],
    outputKeywords: ["plan", "spec", "breakdown", "feature"],
  },
  {
    id: "implementation-agent",
    name: "implementation-agent",
    emoji: "🛠️",
    focus: "Code outputs, implementation progress, and build artifacts.",
    expectedOutputs: ["code changes", "build notes", "implementation outputs"],
    outputKeywords: ["build", "artifact", "implementation", "code"],
  },
  {
    id: "review-agent",
    name: "review-agent",
    emoji: "🔍",
    focus: "Review summaries and approval recommendations.",
    expectedOutputs: ["review summaries", "approval recommendations", "risk notes"],
    outputKeywords: ["review", "approval", "maintainability", "security"],
  },
  {
    id: "debugger-agent",
    name: "debugger-agent",
    emoji: "🪲",
    focus: "Failures, root causes, and verified fixes.",
    expectedOutputs: ["root cause reports", "failure analyses", "fix notes"],
    outputKeywords: ["debug", "root-cause", "failure", "fix"],
  },
  {
    id: "ops-agent",
    name: "ops-agent",
    emoji: "📈",
    focus: "Logs, uptime issues, and monitoring alerts.",
    expectedOutputs: ["ops logs", "incident notes", "monitoring alerts"],
    outputKeywords: ["ops", "log", "uptime", "alert", "incident"],
  },
  {
    id: "docs-agent",
    name: "docs-agent",
    emoji: "📝",
    focus: "README/docs/changelog updates.",
    expectedOutputs: ["documentation updates", "release notes", "README changes"],
    outputKeywords: ["docs", "readme", "changelog", "release"],
  },
  {
    id: "niche-scout",
    name: "niche-scout",
    emoji: "💡",
    focus: "Opportunity and niche reports.",
    expectedOutputs: ["opportunity reports", "research notes", "ranked niches"],
    outputKeywords: ["opportunity", "research", "niche", "market"],
  },
  {
    id: "validation-agent",
    name: "validation-agent",
    emoji: "✅",
    focus: "Build/skip verdicts and validation scorecards.",
    expectedOutputs: ["validation scorecards", "go/no-go verdicts", "assumption notes"],
    outputKeywords: ["validation", "verdict", "scorecard", "go", "kill"],
  },
  {
    id: "fact-checker",
    name: "fact-checker",
    emoji: "📎",
    focus: "Validation results and outdated-claim warnings.",
    expectedOutputs: ["fact checks", "source-backed validation", "outdated claim warnings"],
    outputKeywords: ["fact", "source", "pricing", "api", "outdated"],
  },
  {
    id: "freelancing-optimizer",
    name: "freelancing-optimizer",
    emoji: "💼",
    focus: "Gig drafts, outreach drafts, and pricing ideas.",
    expectedOutputs: ["offer drafts", "outreach drafts", "pricing notes"],
    outputKeywords: ["offer", "outreach", "pricing", "gig"],
  },
];

export function getFleetProfile(agentId: string): FleetAgentProfile | undefined {
  return EXPECTED_FLEET.find((agent) => agent.id === agentId);
}
