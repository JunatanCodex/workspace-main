export type TaskStatus =
  | "queued"
  | "in_progress"
  | "done"
  | "needs_approval"
  | "blocked"
  | "cancelled"
  | "failed"
  | "error"
  | string;

export type AgentHealth =
  | "idle"
  | "running"
  | "waiting"
  | "needs approval"
  | "error"
  | "offline";

export type TriggerType = "on_demand" | "cron" | "heartbeat" | "unknown";

export interface TaskRecord {
  id?: string;
  title?: string;
  description?: string;
  owner?: string;
  status?: TaskStatus;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  source?: string;
  notes?: string | string[] | Record<string, unknown>;
  context?: string | Record<string, unknown> | string[];
  needsApprovalReason?: string;
  failureReason?: string;
  statusHistory?: Array<{ status: string; at?: string; note?: string }>;
  [key: string]: unknown;
}

export interface AgentConfig {
  id: string;
  workspace: string;
  identity?: { name?: string; emoji?: string };
  model?: { primary?: string; fallbacks?: string[] };
}

export interface AgentFileSummary {
  path: string;
  name: string;
  modifiedAt: string;
  size: number;
}

export interface AgentDetails {
  id: string;
  name: string;
  emoji?: string;
  workspace: string;
  role?: string;
  startupInstructions: string[];
  schedule?: string[];
  triggerType: TriggerType;
  latestFile?: AgentFileSummary;
  latestOutputFile?: AgentFileSummary;
  recentFiles: AgentFileSummary[];
  pendingTasks: TaskRecord[];
  recentCompletedTasks: TaskRecord[];
  status: AgentHealth;
  lastRunTime?: string;
  lastOutputTime?: string;
  summary: string;
}

export interface OverviewStats {
  totalAgents: number;
  queuedTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  needsApprovalTasks: number;
  failedOrStalledTasks: number;
  lastOrchestratorRun?: string;
  lastDigestUpdate?: string;
}

export interface AlertItem {
  type: "needs_approval" | "stalled_task" | "inactive_agent" | "routing" | "missing_output" | "failure";
  title: string;
  severity: "info" | "warning" | "critical";
  description: string;
  href?: string;
}
