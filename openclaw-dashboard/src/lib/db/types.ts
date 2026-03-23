import type { AlertItem, AgentDetails, TaskRecord } from "@/lib/types";
import type { AppRole } from "@/lib/auth/roles";

export type DbProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at?: string;
  updated_at?: string;
};

export type DbTaskRow = {
  id: string;
  title: string | null;
  description: string | null;
  owner_agent_id: string | null;
  status: string | null;
  priority: string | null;
  source: string | null;
  context: Record<string, unknown> | string[] | string | null;
  notes: Record<string, unknown> | string[] | string | null;
  needs_approval_reason: string | null;
  failure_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
  created_by?: string | null;
  updated_by?: string | null;
};

export type DbTaskEventRow = {
  id?: string;
  task_id: string;
  event_type: string;
  from_status?: string | null;
  to_status?: string | null;
  note?: string | null;
  actor_user_id?: string | null;
  actor_role?: AppRole | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
};

export type DbPipelineRunRow = {
  id: string;
  pipeline_name: string;
  source_task_id: string | null;
  current_stage: string | null;
  stage_status: string | null;
  final_status: string | null;
  linked_task_ids: string[] | null;
  started_at: string | null;
  updated_at: string | null;
  metadata?: Record<string, unknown> | null;
};

export type DbAlertRow = {
  id: string;
  type: AlertItem["type"] | string;
  title: string;
  severity: AlertItem["severity"] | string;
  description: string;
  href: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CliAuditStatus = "started" | "success" | "error" | "denied";

export type DbCliAuditLogRow = {
  id?: string;
  command_id: string;
  label: string;
  status: CliAuditStatus;
  requested_by?: string | null;
  requested_role?: AppRole | null;
  input?: Record<string, unknown> | null;
  sanitized_args?: string[] | Record<string, unknown> | null;
  stdout?: string | null;
  stderr?: string | null;
  note?: string | null;
  duration_ms?: number | null;
  created_at?: string;
};

export type DashboardTaskReadModel = TaskRecord;
export type DashboardAgentReadModel = AgentDetails;
