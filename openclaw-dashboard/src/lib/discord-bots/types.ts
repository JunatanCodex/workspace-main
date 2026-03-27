export type DiscordBotStatus = "healthy" | "degraded" | "failed" | "restarting" | "stopped" | string;

export interface DiscordBotCommands {
  install?: string;
  build?: string;
  start?: string;
  healthCheck?: string;
}

export interface DiscordBotRegistryEntry {
  bot_id: string;
  name: string;
  repo_url: string;
  branch: string;
  runtime_type: string;
  working_directory: string;
  commands: DiscordBotCommands;
  env_var_names: string[];
  status: DiscordBotStatus;
  health_score: number;
  last_deployed_at?: string | null;
  last_healthy_at?: string | null;
  restart_count: number;
  auto_fix_enabled: boolean;
  rollback_enabled: boolean;
  current_commit?: string | null;
  previous_healthy_commit?: string | null;
  last_incident_id?: string | null;
  last_deployment_id?: string | null;
  restart_policy?: string;
  template?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscordBotSecretRecord {
  DISCORD_TOKEN?: string;
  CLIENT_ID?: string;
  GUILD_ID?: string;
  additional_env?: Record<string, string>;
}

export interface DiscordDeploymentRecord {
  deployment_id: string;
  bot_id: string;
  repo_url: string;
  branch: string;
  commit?: string | null;
  started_at: string;
  finished_at?: string | null;
  status: string;
  validation_result?: string;
  rollback_available?: boolean;
  summary?: string;
  artifacts?: string[];
}

export interface DiscordIncidentRecord {
  incident_id: string;
  bot_id: string;
  detected_at: string;
  severity: "info" | "warning" | "critical";
  raw_error_excerpt?: string;
  human_summary: string;
  likely_cause?: string;
  attempted_fixes?: string[];
  resolved: boolean;
  resolved_at?: string | null;
  escalation_required: boolean;
}

export interface DiscordBotView extends DiscordBotRegistryEntry {
  masked_env: Array<{ name: string; configured: boolean }>;
  deployment_count: number;
  incident_count: number;
  last_deployment?: DiscordDeploymentRecord;
  last_incident?: DiscordIncidentRecord;
  available_actions: string[];
  uptime_label: string;
}

export interface DiscordHealthReport {
  updatedAt?: string | null;
  bots: Array<{ bot_id: string; status: string; health_score: number; summary?: string }>;
}
