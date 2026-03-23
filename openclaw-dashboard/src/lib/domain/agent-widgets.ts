import type { AgentDetails } from "@/lib/types";

export interface AgentWidgetData {
  title: string;
  lines: string[];
}

function names(files: AgentDetails["suggestedOutputFiles"]) {
  return files.map((file) => file.name);
}

export function getAgentWidgetData(agent: AgentDetails): AgentWidgetData[] {
  const suggested = names(agent.suggestedOutputFiles);
  const pending = agent.pendingTasks.length;
  const completed = agent.recentCompletedTasks.length;

  switch (agent.id) {
    case "orchestrator":
      return [
        {
          title: "Control tower signals",
          lines: [
            `${pending} pending routed task(s) currently assigned.`,
            agent.latestOutputFile ? `Latest coordination artifact: ${agent.latestOutputFile.name}` : "No digest/routing artifact found yet.",
            agent.summary,
          ],
        },
      ];
    case "lead-developer":
      return [
        {
          title: "Architecture guidance",
          lines: [
            suggested.length ? `Best matching architecture outputs: ${suggested.slice(0, 3).join(", ")}.` : "No architecture decision artifact found yet.",
            `${completed} completed technical guidance task(s).`,
            "Use this page to inspect decisions, tradeoffs, and recommendation files.",
          ],
        },
      ];
    case "feature-planner":
      return [
        {
          title: "Planning output",
          lines: [
            suggested.length ? `Recent planning/spec files: ${suggested.slice(0, 3).join(", ")}.` : "No planning docs found yet.",
            `${pending} planning task(s) currently active.`,
            "Watch for specs and breakdowns that implementation-agent can pick up next.",
          ],
        },
      ];
    case "implementation-agent":
      return [
        {
          title: "Build activity",
          lines: [
            suggested.length ? `Likely build or implementation artifacts: ${suggested.slice(0, 3).join(", ")}.` : "No implementation artifact found yet.",
            `${pending} implementation task(s) active.`,
            "Look here for code-output-adjacent notes and build summaries.",
          ],
        },
      ];
    case "review-agent":
      return [
        {
          title: "Review posture",
          lines: [
            suggested.length ? `Recent review outputs: ${suggested.slice(0, 3).join(", ")}.` : "No review summary found yet.",
            `${pending} review task(s) active.`,
            "Approval recommendations and severity summaries should surface here.",
          ],
        },
      ];
    case "debugger-agent":
      return [
        {
          title: "Failure analysis",
          lines: [
            suggested.length ? `Root-cause / fix files: ${suggested.slice(0, 3).join(", ")}.` : "No debugging report found yet.",
            `${pending} debugging task(s) active.`,
            "Use this section to quickly inspect failures, causes, and verified fixes.",
          ],
        },
      ];
    case "ops-agent":
      return [
        {
          title: "Operational watch",
          lines: [
            suggested.length ? `Recent ops/log artifacts: ${suggested.slice(0, 3).join(", ")}.` : "No ops incident/log file found yet.",
            `${pending} ops task(s) active.`,
            "This agent should surface uptime issues, logs, and alerts over time.",
          ],
        },
      ];
    case "docs-agent":
      return [
        {
          title: "Documentation updates",
          lines: [
            suggested.length ? `Recent docs/release files: ${suggested.slice(0, 3).join(", ")}.` : "No docs update artifact found yet.",
            `${completed} documentation task(s) completed.`,
            "README, docs, and changelog changes should become visible here.",
          ],
        },
      ];
    case "niche-scout":
      return [
        {
          title: "Opportunity scouting",
          lines: [
            suggested.length ? `Recent opportunity outputs: ${suggested.slice(0, 3).join(", ")}.` : "No scouting report found yet.",
            `${pending} scouting task(s) active.`,
            "Watch for market scans, research notes, and ranked opportunities.",
          ],
        },
      ];
    case "validation-agent":
      return [
        {
          title: "Validation verdicts",
          lines: [
            suggested.length ? `Recent validation artifacts: ${suggested.slice(0, 3).join(", ")}.` : "No validation scorecard found yet.",
            `${pending} validation task(s) active.`,
            "Go / test-first / service-first / kill verdicts should stand out here.",
          ],
        },
      ];
    case "fact-checker":
      return [
        {
          title: "Fact-check status",
          lines: [
            suggested.length ? `Recent verification outputs: ${suggested.slice(0, 3).join(", ")}.` : "No fact-check artifact found yet.",
            `${pending} verification task(s) active.`,
            "Outdated-claim warnings and source-backed checks should be easy to inspect here.",
          ],
        },
      ];
    case "freelancing-optimizer":
      return [
        {
          title: "Offer and outreach pipeline",
          lines: [
            suggested.length ? `Recent monetization outputs: ${suggested.slice(0, 3).join(", ")}.` : "No offer/outreach artifact found yet.",
            `${pending} monetization task(s) active.`,
            "Gig drafts, outreach drafts, and pricing notes should show up here.",
          ],
        },
      ];
    default:
      return [
        {
          title: "Agent summary",
          lines: [agent.summary, `${pending} pending task(s).`, suggested.length ? `Suggested outputs: ${suggested.slice(0, 3).join(", ")}.` : "No suggested outputs yet."],
        },
      ];
  }
}
