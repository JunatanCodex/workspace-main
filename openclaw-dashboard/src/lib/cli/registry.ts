export type CliSupport = "supported" | "partial" | "planned" | "requires-cli-mapping";

export interface CliCommandDefinition {
  id: string;
  label: string;
  support: CliSupport;
  description: string;
}

export const CLI_COMMANDS: CliCommandDefinition[] = [
  { id: "trigger-orchestrator", label: "Trigger orchestrator", support: "supported", description: "Run orchestrator via local OpenClaw CLI." },
  { id: "trigger-agent", label: "Trigger agent", support: "supported", description: "Run a specific agent via local OpenClaw CLI." },
  { id: "refresh-state", label: "Refresh state", support: "supported", description: "Reload dashboard state from filesystem and runtime logs." },
  { id: "create-task", label: "Create task", support: "supported", description: "Create task via dashboard backend service." },
  { id: "requeue-task", label: "Requeue task", support: "supported", description: "Requeue task via dashboard backend service." },
  { id: "mark-approval", label: "Mark needs approval", support: "supported", description: "Escalate a task via dashboard backend service." },
  { id: "mark-done", label: "Mark task done", support: "partial", description: "Planned file-backed task completion update." },
  { id: "reassign-task", label: "Reassign task", support: "partial", description: "Planned file-backed reassignment flow." },
  { id: "open-workspace", label: "Open workspace path", support: "requires-cli-mapping", description: "Requires environment-specific OS/CLI mapping." },
];

export function getCliCommand(id: string) {
  return CLI_COMMANDS.find((command) => command.id === id) || null;
}
