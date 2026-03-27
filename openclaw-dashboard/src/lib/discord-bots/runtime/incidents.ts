import { saveDiscordIncident } from "@/lib/discord-bots/store";
import type { DiscordIncidentRecord } from "@/lib/discord-bots/types";

export function translateError(raw: string) {
  const text = raw || "Unknown runtime failure.";
  if (/token|login|401|unauthorized/i.test(text)) {
    return {
      human_summary: "The bot failed to authenticate with Discord.",
      likely_cause: "Invalid, missing, expired, or revoked Discord token.",
    };
  }
  if (/module not found|cannot find module|importerror|modulenotfounderror/i.test(text)) {
    return {
      human_summary: "The bot is missing a dependency at runtime.",
      likely_cause: "Dependencies were not installed correctly or the build/runtime environment is incomplete.",
    };
  }
  if (/command not found|not recognized/i.test(text)) {
    return {
      human_summary: "A configured runtime command could not be executed.",
      likely_cause: "The start/build/install command is invalid for this bot or the runtime is missing.",
    };
  }
  if (/enoent|no such file/i.test(text)) {
    return {
      human_summary: "A required file or working directory was missing.",
      likely_cause: "Repository layout, working directory, or expected artifact path does not match the configured bot setup.",
    };
  }
  return {
    human_summary: "The bot encountered a runtime or deployment failure.",
    likely_cause: "See the raw error excerpt and latest logs for the exact failing step.",
  };
}

export async function createIncident(bot_id: string, raw: string, attempted_fixes: string[] = [], escalation_required = false): Promise<DiscordIncidentRecord> {
  const translated = translateError(raw);
  const incident: DiscordIncidentRecord = {
    incident_id: `incident-${bot_id}-${Date.now()}`,
    bot_id,
    detected_at: new Date().toISOString(),
    severity: escalation_required ? "critical" : "warning",
    raw_error_excerpt: raw.slice(0, 1200),
    human_summary: translated.human_summary,
    likely_cause: translated.likely_cause,
    attempted_fixes,
    resolved: false,
    resolved_at: null,
    escalation_required,
  };
  await saveDiscordIncident(incident);
  return incident;
}
