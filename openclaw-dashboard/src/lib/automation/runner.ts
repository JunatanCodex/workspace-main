import { promises as fs } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { sharedStore, SharedAutomationRules, SharedEvent, SharedPipelineDef, SharedPipelineRun } from "@/lib/automation/store";
import { appendTriggerLog } from "@/lib/runtime/trigger-log";

type TaskStatus = 'queued' | 'in_progress' | 'done' | 'failed' | 'needs_approval' | 'blocked' | 'cancelled';

type Task = Record<string, unknown> & {
  id?: string;
  title?: string;
  description?: string;
  owner?: string;
  status?: TaskStatus | string;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  context?: Record<string, unknown>;
  statusHistory?: Array<{ status: string; at: string; note?: string }>;
  outputFiles?: string[];
  failureReason?: string;
};

type RunResults = {
  taskId?: string;
  owner?: string;
  upstreamTaskId?: string;
  planArtifact?: string | null;
  workspace?: string | null;
  startedAt?: string;
  finishedAt?: string;
  status?: string;
  executionAttempted?: boolean;
  codeChanged?: boolean;
  success?: boolean;
  needsApproval?: boolean;
  failureRoutingRecommended?: boolean;
  commands?: Array<{
    name?: string;
    command?: string;
    cwd?: string;
    exitCode?: number | null;
    timedOut?: boolean;
    durationMs?: number;
    status?: string;
  }>;
  artifacts?: {
    summary?: string;
    changedFiles?: string;
    executionLog?: string;
    runResults?: string;
  };
  failedCommand?: { name?: string; command?: string; exitCode?: number | null } | null;
  errorSummary?: string | null;
  notes?: string[];
};

const IMPLEMENTATION_WORKSPACE = "/home/jim/.openclaw/agents/implementation-agent";

function now() { return new Date().toISOString(); }
function taskLabel(task: Task) { return task.title || task.description || task.id || 'Untitled task'; }
function hasMarker(text: string, markers: string[]) {
  const upper = text.toUpperCase();
  return markers.some((m) => upper.includes(m.toUpperCase()));
}
function safeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48);
}
function buildTaskId(prefix: string) { return `${prefix}-${Date.now()}`; }
function getNewestOutputFiles(task: Task): string[] {
  return Array.isArray(task.outputFiles) ? task.outputFiles : [];
}
function getTaskSignals(task: Task) {
  const historyNotes = Array.isArray(task.statusHistory)
    ? task.statusHistory.map((entry) => `${entry.status}: ${entry.note || ""}`).join("\n")
    : "";

  return [
    historyNotes,
    task.failureReason || "",
    JSON.stringify(task.context || {}),
    JSON.stringify(task.outputFiles || []),
  ].join("\n");
}
function artifactPath(taskId: string, suffix: string) {
  return `workspace/${taskId}-${suffix}`;
}
function nonTerminalStatus(status: string | undefined) {
  return !['done', 'failed', 'cancelled'].includes(String(status || ''));
}
async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}
function resolveArtifactPath(relativeOrAbsolute: string) {
  return path.isAbsolute(relativeOrAbsolute)
    ? relativeOrAbsolute
    : path.join(IMPLEMENTATION_WORKSPACE, relativeOrAbsolute);
}
function getRunResultsPath(task: Task) {
  const outputs = getNewestOutputFiles(task);
  const explicit = outputs.find((file) => file.endsWith('-run-results.json'))
    || String(task.context?.runResultsFile || '');
  if (explicit) return explicit;
  const taskId = String(task.id || '');
  return taskId ? artifactPath(taskId, 'run-results.json') : '';
}
async function loadRunResults(task: Task): Promise<{ relativePath: string | null; absolutePath: string | null; data: RunResults | null }> {
  const relativePath = getRunResultsPath(task) || null;
  if (!relativePath) return { relativePath: null, absolutePath: null, data: null };
  const absolutePath = resolveArtifactPath(relativePath);
  const data = await readJsonIfExists<RunResults>(absolutePath);
  return { relativePath, absolutePath, data };
}
function hasImplementationArtifacts(task: Task, runResults: RunResults | null) {
  const taskId = String(task.id || '');
  const outputs = new Set(getNewestOutputFiles(task));
  const expected = [
    artifactPath(taskId, 'implementation-summary.md'),
    artifactPath(taskId, 'changed-files.json'),
    artifactPath(taskId, 'execution-log.txt'),
    artifactPath(taskId, 'run-results.json'),
  ];
  const outputCoverage = expected.every((item) => outputs.has(item));
  const artifactCoverage = Boolean(
    runResults?.artifacts?.summary
    && runResults?.artifacts?.changedFiles
    && runResults?.artifacts?.executionLog
    && runResults?.artifacts?.runResults,
  );
  return outputCoverage || artifactCoverage;
}
function implementationDuplicateExists(tasks: Task[], plannerTask: Task, projectWorkspace: string, planArtifact: string | null) {
  const upstreamTaskId = String(plannerTask.id || '');
  return tasks.some((task) => {
    if (task.owner !== 'implementation-agent') return false;
    const context = task.context || {};
    const sameUpstream = String(context.upstreamTaskId || '') === upstreamTaskId;
    const sameWorkspace = String(context.projectWorkspace || '') === projectWorkspace;
    const samePlan = String(context.planArtifact || '') === String(planArtifact || '');
    const status = String(task.status || '');
    return sameUpstream && sameWorkspace && samePlan && ['queued', 'in_progress', 'done', 'needs_approval'].includes(status);
  });
}
function debuggerDuplicateExists(tasks: Task[], implementationTaskId: string, failedCommand: string) {
  return tasks.some((task) => {
    if (task.owner !== 'debugger-agent') return false;
    const context = task.context || {};
    return String(context.dependsOn || '') === implementationTaskId
      && String(context.failedCommand || '') === failedCommand
      && nonTerminalStatus(String(task.status || ''));
  });
}
function reviewDuplicateExists(tasks: Task[], implementationTaskId: string) {
  return tasks.some((task) => task.owner === 'review-agent'
    && String(task.context?.dependsOn || task.context?.upstreamTaskId || '') === implementationTaskId
    && nonTerminalStatus(String(task.status || '')));
}
function eventExists(events: SharedEvent[], sourceTaskId: string, actionTaken: string) {
  return events.some((event) => event.source_task_id === sourceTaskId && event.action_taken === actionTaken);
}
function anyEventExists(events: SharedEvent[], newEvents: SharedEvent[], sourceTaskId: string, actionTaken: string) {
  return eventExists(events, sourceTaskId, actionTaken)
    || newEvents.some((event) => event.source_task_id === sourceTaskId && event.action_taken === actionTaken);
}
function createTask({ owner, title, description, context, sourceTaskId, pipeline, outputFiles }: { owner: string; title: string; description: string; context: Record<string, unknown>; sourceTaskId: string; pipeline: string; outputFiles?: string[]; }): Task {
  const id = buildTaskId(`${pipeline}-${safeSlug(owner)}`);
  const timestamp = now();
  return {
    id,
    title,
    description,
    owner,
    status: 'queued',
    priority: 'medium',
    createdAt: timestamp,
    updatedAt: timestamp,
    source: 'auto-trigger',
    context: { ...context, pipeline, upstreamTaskId: sourceTaskId },
    outputFiles,
    statusHistory: [{ status: 'queued', at: timestamp, note: `Auto-created from ${sourceTaskId}.` }],
  };
}

function openTasks(tasks: Task[]) {
  return tasks.filter((task) => nonTerminalStatus(String(task.status || '')));
}

function duplicateExists(tasks: Task[], owner: string, upstreamTaskId: string, pipeline: string) {
  return openTasks(tasks).some((task) => task.owner === owner && task.context?.upstreamTaskId === upstreamTaskId && task.context?.pipeline === pipeline);
}

function implementationArtifactsForTask(taskId: string) {
  return [
    artifactPath(taskId, 'implementation-summary.md'),
    artifactPath(taskId, 'changed-files.json'),
    artifactPath(taskId, 'execution-log.txt'),
    artifactPath(taskId, 'run-results.json'),
  ];
}

function inferPlanArtifact(task: Task) {
  const outputs = getNewestOutputFiles(task);
  return outputs.find((file) => /(plan|breakdown|spec)/i.test(file)) || outputs[0] || null;
}

function buildImplementationTriggerMessage(task: Task) {
  const taskId = String(task.id || '');
  const context = task.context || {};
  const planArtifact = String(context.planArtifact || '');
  const projectWorkspace = String(context.projectWorkspace || '');
  const upstreamTaskId = String(context.upstreamTaskId || context.dependsOn || '');
  const summaryFile = artifactPath(taskId, 'implementation-summary.md');
  const changedFilesFile = artifactPath(taskId, 'changed-files.json');
  const executionLogFile = artifactPath(taskId, 'execution-log.txt');
  const runResultsFile = artifactPath(taskId, 'run-results.json');

  return [
    `Process implementation task ${taskId} automatically.`,
    `Task title: ${String(task.title || task.description || taskId)}`,
    `Approved project workspace: ${projectWorkspace}`,
    `Upstream plan task id: ${upstreamTaskId}`,
    `Plan artifact: ${planArtifact}`,
    '',
    'Critical task-selection rules:',
    `- You must operate on the existing shared task with id ${taskId}.`,
    `- Do not create a new task. Do not rename the task. Do not switch to a different implementation task unless ${taskId} is missing from ~/.openclaw/shared/tasks.json.`,
    `- If ${taskId} exists and is queued, move that exact task to in_progress before coding.`,
    `- If there are other similar implementation tasks for the same upstream plan, ignore them unless they are this exact task id.`,
    '',
    'Requirements:',
    '- Read the approved plan and upstream context first.',
    '- Work only inside the approved project workspace.',
    '- If the approved workspace already contains a project, modify that project instead of scaffolding a brand-new unrelated one.',
    '- Modify project files required to implement the task.',
    '- Run only safe local verification commands appropriate to the project.',
    '- Capture stdout, stderr, exit codes, and relevant logs.',
    '- Save these required artifacts in the implementation-agent workspace using this exact task id:',
    `  - ${summaryFile}`,
    `  - ${changedFilesFile}`,
    `  - ${executionLogFile}`,
    `  - ${runResultsFile}`,
    '- Mark the task done only if code changed and execution was attempted successfully.',
    '- Mark the task failed if execution failed after an attempt.',
    '- Mark the task needs_approval if blocked by ambiguity, permissions, risky changes, or lack of a safe verification path.',
    '- Do not deploy, do not run destructive commands, do not modify secrets or env files without explicit authorization.',
    '',
    `When complete, update ~/.openclaw/shared/tasks.json for task ${taskId} with accurate status and artifact references.`,
  ].join('\n');
}

async function triggerAgentRun(agentId: string, message: string) {
  const startedAt = now();
  try {
    const child = spawn(
      'openclaw',
      ['agent', '--agent', agentId, '--message', message, '--json'],
      {
        cwd: '/home/jim/.openclaw/workspace-main/openclaw-dashboard',
        detached: true,
        stdio: 'ignore',
      },
    );
    child.unref();

    await appendTriggerLog({
      startedAt,
      finishedAt: now(),
      agentId,
      message,
      ok: true,
      mode: 'detached-background-spawn',
      note: 'Automation runner dispatched agent trigger asynchronously.',
    });

    return {
      ok: true,
      mode: 'detached-background-spawn',
    };
  } catch (error) {
    const err = error as Error;
    await appendTriggerLog({
      startedAt,
      finishedAt: now(),
      agentId,
      message,
      ok: false,
      mode: 'detached-background-spawn',
      error: err.message,
    });
    return {
      ok: false,
      error: err.message,
    };
  }
}

function isImplementationPlanValid(task: Task) {
  const context = task.context || {};
  const projectWorkspace = String(context.projectWorkspace || '').trim();
  const planApproved = context.planApproved !== false;
  const planArtifact = String(context.planArtifact || inferPlanArtifact(task) || '').trim();
  return {
    valid: Boolean(projectWorkspace && planApproved && planArtifact),
    projectWorkspace,
    planArtifact: planArtifact || null,
  };
}

function updateTaskOutputFiles(task: Task, outputFiles: string[]) {
  const current = new Set(getNewestOutputFiles(task));
  outputFiles.forEach((file) => current.add(file));
  task.outputFiles = Array.from(current);
}

export async function runAutomationSweep() {
  const [tasksRaw, pipelinesDoc, runsDoc, eventsDoc, rules] = await Promise.all([
    sharedStore.readTasks(),
    sharedStore.readPipelines(),
    sharedStore.readRuns(),
    sharedStore.readEvents(),
    sharedStore.readRules(),
  ]);

  const tasks = tasksRaw as Task[];
  const events: SharedEvent[] = Array.isArray(eventsDoc.events) ? eventsDoc.events : [];
  const runs: SharedPipelineRun[] = Array.isArray(runsDoc.runs) ? runsDoc.runs : [];
  const pipelines: SharedPipelineDef[] = Array.isArray(pipelinesDoc.pipelines) ? pipelinesDoc.pipelines : [];
  const positive = (rules as SharedAutomationRules)?.output_parsing?.positive_markers || ['BUILD','STRONG','VIABLE','APPROVE','PASS','VALID','CONFIRMED'];
  const negative = (rules as SharedAutomationRules)?.output_parsing?.negative_markers || ['SKIP','WEAK','FAIL','OUTDATED','BLOCKED','NEEDS FIX','NEEDS_APPROVAL'];
  const newEvents: SharedEvent[] = [];
  let changed = false;

  const enabledPipelines = new Set(pipelines.filter((pipeline) => pipeline.enabled).map((pipeline) => pipeline.pipeline_name));
  const doneTasks = tasks.filter((task) => task.status === 'done');
  const failedTasks = tasks.filter((task) => task.status === 'failed');
  const approvalTasks = tasks.filter((task) => task.status === 'needs_approval');

  function appendEvent(evt: SharedEvent) {
    newEvents.push(evt);
    changed = true;
  }

  function buildEvent(evt: SharedEvent): SharedEvent {
    return {
      ...evt,
      metadata: {
        pipeline: evt.metadata?.pipeline ?? null,
        upstreamTaskId: evt.metadata?.upstreamTaskId ?? null,
        runResultsFile: evt.metadata?.runResultsFile ?? null,
        failedCommand: evt.metadata?.failedCommand ?? null,
      },
    };
  }

  function updateRun(pipelineName: string, sourceTaskId: string, currentStage: string, finalStatus = 'running', linkedTaskId?: string, stageStatus?: string, execution?: SharedPipelineRun['execution']) {
    if (!enabledPipelines.has(pipelineName)) return;
    let run = runs.find((r) => r.pipeline_name === pipelineName && r.source_task_id === sourceTaskId);
    if (!run) {
      run = {
        run_id: `${pipelineName}-${safeSlug(sourceTaskId || 'root')}-${Date.now()}`,
        pipeline_name: pipelineName,
        source_task_id: sourceTaskId,
        current_stage: currentStage,
        stage_status: stageStatus || 'queued',
        linked_task_ids: linkedTaskId ? [linkedTaskId] : [sourceTaskId],
        started_at: now(),
        updated_at: now(),
        final_status: finalStatus,
        execution: execution || { attempted: null, success: null, failed_task_id: null, run_results_file: null, last_command: null },
      };
      runs.push(run);
    } else {
      run.current_stage = currentStage;
      run.updated_at = now();
      run.final_status = finalStatus;
      run.stage_status = stageStatus || run.stage_status;
      run.execution = { ...(run.execution || {}), ...(execution || {}) };
      if (linkedTaskId && !run.linked_task_ids.includes(linkedTaskId)) run.linked_task_ids.push(linkedTaskId);
    }
    changed = true;
  }

  for (const task of doneTasks) {
    const owner = String(task.owner || '');
    const taskId = String(task.id || '');
    if (!taskId) continue;
    const outputsJoined = getTaskSignals(task);

    if (owner === 'lead-developer') {
      const action = 'auto-create-feature-planner';
      if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'feature-planner', taskId, 'development-default')) {
        const next = createTask({ owner: 'feature-planner', title: `Plan follow-up for ${taskLabel(task)}`, description: 'Create a technical feature/task breakdown from the approved architecture decision.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
        tasks.push(next); updateRun('development-default', taskId, 'planning', 'running', String(next.id), 'queued');
        appendEvent(buildEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Lead-developer completion triggered feature-planner.' }));
      }
    }

    if (owner === 'feature-planner') {
      const plan = isImplementationPlanValid(task);
      const action = 'auto-create-implementation-agent';
      if (!plan.valid) {
        if (!anyEventExists(events, newEvents, taskId, 'implementation-plan-invalid-or-incomplete')) {
          appendEvent(buildEvent({
            timestamp: now(),
            event_type: 'duplicate_downstream_task_blocked',
            source_task_id: taskId,
            source_agent: owner,
            action_taken: 'implementation-plan-invalid-or-incomplete',
            created_task_id: null,
            notes: 'Feature-planner completed, but implementation task was not created because projectWorkspace and/or planArtifact were missing.',
            metadata: { pipeline: 'development-default', upstreamTaskId: taskId },
          }));
        }
      } else if (!eventExists(events, taskId, action) && !implementationDuplicateExists(tasks, task, plan.projectWorkspace, plan.planArtifact)) {
        const next = createTask({
          owner: 'implementation-agent',
          title: `Implement planned work for ${taskLabel(task)}`,
          description: 'Implement the planned feature based on the completed feature-planning output.',
          context: {
            derivedFrom: taskId,
            dependsOn: taskId,
            priorOutputs: getNewestOutputFiles(task),
            planApproved: true,
            planArtifact: plan.planArtifact,
            projectWorkspace: plan.projectWorkspace,
            executionPolicy: 'safe-local-verify-only',
            allowlistedCommandProfile: 'default',
          },
          sourceTaskId: taskId,
          pipeline: 'development-default',
        });
        const nextId = String(next.id);
        next.outputFiles = implementationArtifactsForTask(nextId);
        tasks.push(next);
        updateRun('development-default', taskId, 'implementation', 'running', nextId, 'queued');
        appendEvent(buildEvent({ timestamp: now(), event_type: 'implementation_task_created', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: nextId, notes: 'Feature-planner completion triggered implementation-agent.', metadata: { pipeline: 'development-default', upstreamTaskId: taskId } }));

        const triggerMessage = buildImplementationTriggerMessage(next);
        const triggerResult = await triggerAgentRun('implementation-agent', triggerMessage);
        if (triggerResult.ok) {
          appendEvent(buildEvent({
            timestamp: now(),
            event_type: 'implementation_execution_started',
            source_task_id: nextId,
            source_agent: 'orchestrator',
            action_taken: 'trigger-implementation-agent-run',
            created_task_id: null,
            notes: 'Implementation-agent was triggered automatically for the newly created implementation task.',
            metadata: { pipeline: 'development-default', upstreamTaskId: taskId },
          }));
        } else {
          appendEvent(buildEvent({
            timestamp: now(),
            event_type: 'duplicate_downstream_task_blocked',
            source_task_id: nextId,
            source_agent: 'orchestrator',
            action_taken: 'implementation-agent-trigger-failed',
            created_task_id: null,
            notes: `Implementation task was created, but automatic trigger failed: ${triggerResult.error || 'unknown error'}`,
            metadata: { pipeline: 'development-default', upstreamTaskId: taskId },
          }));
        }
      }
    }

    if (owner === 'implementation-agent') {
      const runResultsRef = await loadRunResults(task);
      const runResults = runResultsRef.data;
      updateTaskOutputFiles(task, implementationArtifactsForTask(taskId));
      const executionAttempted = Boolean(runResults?.executionAttempted);
      const success = runResults?.success === true;
      const codeChanged = runResults?.codeChanged === true;
      const hasArtifacts = hasImplementationArtifacts(task, runResults);
      const lastCommand = runResults?.failedCommand?.command || runResults?.commands?.slice(-1)?.[0]?.command || null;

      if (executionAttempted) {
        const executionAction = success ? 'implementation-execution-finished' : 'implementation-execution-failed';
        if (!anyEventExists(events, newEvents, taskId, executionAction)) {
          appendEvent(buildEvent({
            timestamp: now(),
            event_type: success ? 'implementation_execution_finished' : 'implementation_execution_failed',
            source_task_id: taskId,
            source_agent: owner,
            action_taken: executionAction,
            created_task_id: null,
            notes: success ? 'Implementation artifacts show a successful execution attempt.' : 'Implementation artifacts show a failed execution attempt.',
            metadata: { pipeline: 'development-default', upstreamTaskId: String(task.context?.upstreamTaskId || ''), runResultsFile: runResultsRef.relativePath, failedCommand: success ? null : (lastCommand || null) },
          }));
        }
      }

      if (!(executionAttempted && hasArtifacts)) {
        if (!anyEventExists(events, newEvents, taskId, 'implementation-missing-execution-evidence')) {
          appendEvent(buildEvent({
            timestamp: now(),
            event_type: 'duplicate_downstream_task_blocked',
            source_task_id: taskId,
            source_agent: owner,
            action_taken: 'implementation-missing-execution-evidence',
            created_task_id: null,
            notes: 'Implementation task was done, but review routing was blocked because execution evidence or required artifacts were missing.',
            metadata: { pipeline: 'development-default', upstreamTaskId: String(task.context?.upstreamTaskId || ''), runResultsFile: runResultsRef.relativePath },
          }));
        }
      } else if (success && codeChanged) {
        const action = 'auto-create-review-agent';
        if (!eventExists(events, taskId, action) && !reviewDuplicateExists(tasks, taskId)) {
          const next = createTask({
            owner: 'review-agent',
            title: `Review implementation for ${taskLabel(task)}`,
            description: 'Review implementation output for bugs, edge cases, and acceptability.',
            context: {
              derivedFrom: taskId,
              dependsOn: taskId,
              upstreamPlanTaskId: String(task.context?.upstreamTaskId || ''),
              priorOutputs: getNewestOutputFiles(task),
              runResultsFile: runResultsRef.relativePath,
              changedFilesFile: artifactPath(taskId, 'changed-files.json'),
              implementationSummaryFile: artifactPath(taskId, 'implementation-summary.md'),
            },
            sourceTaskId: taskId,
            pipeline: 'development-default',
          });
          tasks.push(next);
          updateRun('development-default', String(task.context?.upstreamTaskId || taskId), 'review', 'running', String(next.id), 'queued', {
            attempted: true,
            success: true,
            failed_task_id: null,
            run_results_file: runResultsRef.relativePath,
            last_command: lastCommand,
          });
          appendEvent(buildEvent({ timestamp: now(), event_type: 'review_task_created_from_implementation_success', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Implementation completion triggered review-agent.', metadata: { pipeline: 'development-default', upstreamTaskId: String(task.context?.upstreamTaskId || ''), runResultsFile: runResultsRef.relativePath } }));
        }
      }
    }

    if (owner === 'review-agent') {
      const pass = hasMarker(outputsJoined, positive) || !hasMarker(outputsJoined, negative);
      const fail = hasMarker(outputsJoined, ['FAIL', 'NEEDS FIX', 'CRITICAL']);
      if (fail) {
        const action = 'auto-create-debugger-agent';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'debugger-agent', taskId, 'development-default')) {
          const next = createTask({ owner: 'debugger-agent', title: `Debug follow-up for ${taskLabel(task)}`, description: 'Investigate failed review findings and produce a root cause + fix recommendation.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
          tasks.push(next); updateRun('development-default', taskId, 'debugging', 'running', String(next.id), 'queued');
          appendEvent(buildEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Review failure routed to debugger-agent.' }));
        }
      } else if (pass) {
        const action = 'auto-create-ops-agent';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'ops-agent', taskId, 'development-default')) {
          const next = createTask({ owner: 'ops-agent', title: `Operational follow-up for ${taskLabel(task)}`, description: 'Inspect operational/usage impact after a successful review.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
          tasks.push(next); updateRun('development-default', taskId, 'operations', 'running', String(next.id), 'queued');
          appendEvent(buildEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Review pass triggered ops-agent.' }));
        }
      }
    }

    if (owner === 'debugger-agent') {
      const action = 'auto-create-implementation-followup';
      if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'implementation-agent', taskId, 'development-default')) {
        const next = createTask({ owner: 'implementation-agent', title: `Implementation follow-up for ${taskLabel(task)}`, description: 'Apply debugger findings and recommended fixes.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
        tasks.push(next); updateRun('development-default', taskId, 'implementation', 'running', String(next.id), 'queued');
        appendEvent(buildEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Debugger completion triggered implementation follow-up.' }));
      }
    }

    if (owner === 'ops-agent') {
      const issue = hasMarker(outputsJoined, ['ISSUE', 'ERROR', 'WARNING', 'ALERT']);
      if (issue) {
        const action = 'auto-create-debugger-from-ops';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'debugger-agent', taskId, 'development-default')) {
          const next = createTask({ owner: 'debugger-agent', title: `Investigate operational issue from ${taskLabel(task)}`, description: 'Inspect operational findings and produce debugging guidance.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
          tasks.push(next); updateRun('development-default', taskId, 'debugging', 'running', String(next.id), 'queued');
          appendEvent(buildEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Ops findings triggered debugger-agent.' }));
        }
      } else if (!anyEventExists(events, newEvents, taskId, 'development-pipeline-healthy')) {
        updateRun('development-default', taskId, 'operations', 'healthy', undefined, 'done');
        appendEvent(buildEvent({ timestamp: now(), event_type: 'pipeline_healthy', source_task_id: taskId, source_agent: owner, action_taken: 'development-pipeline-healthy', created_task_id: null, notes: 'Ops-agent completed without operational issues.' }));
      }
    }

    if (owner === 'niche-scout') {
      const action = 'auto-create-validation-agent';
      if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'validation-agent', taskId, 'business-default')) {
        const next = createTask({ owner: 'validation-agent', title: `Validate opportunity from ${taskLabel(task)}`, description: 'Validate the strongest monetizable niche discovered by niche-scout.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'business-default' });
        tasks.push(next); updateRun('business-default', taskId, 'validation', 'running', String(next.id), 'queued');
        appendEvent(buildEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Niche-scout completion triggered validation-agent.' }));
      }
    }

    if (owner === 'validation-agent') {
      const viable = hasMarker(outputsJoined, ['BUILD', 'STRONG', 'VIABLE']);
      const weak = hasMarker(outputsJoined, ['SKIP', 'WEAK', 'NOT VIABLE']);
      if (viable) {
        const action = 'auto-create-fact-checker';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'fact-checker', taskId, 'business-default')) {
          const next = createTask({ owner: 'fact-checker', title: `Fact-check validated opportunity from ${taskLabel(task)}`, description: 'Verify assumptions and claims for the validated business opportunity.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'business-default' });
          tasks.push(next); updateRun('business-default', taskId, 'fact_checking', 'running', String(next.id), 'queued');
          appendEvent(buildEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Validation verdict triggered fact-checker.' }));
        }
      } else if (weak && !anyEventExists(events, newEvents, taskId, 'business-pipeline-stopped-after-validation')) {
        updateRun('business-default', taskId, 'validation', 'stopped', undefined, 'failed');
        appendEvent(buildEvent({ timestamp: now(), event_type: 'pipeline_stop', source_task_id: taskId, source_agent: owner, action_taken: 'business-pipeline-stopped-after-validation', created_task_id: null, notes: 'Validation result was weak/skip, so the branch was stopped.' }));
      }
    }

    if (owner === 'fact-checker') {
      const valid = hasMarker(outputsJoined, ['VALID', 'CONFIRMED', 'FEASIBLE']);
      const blocked = hasMarker(outputsJoined, ['OUTDATED', 'BLOCKED', 'INCORRECT']);
      if (valid) {
        const action = 'auto-create-freelancing-optimizer';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'freelancing-optimizer', taskId, 'business-default')) {
          const next = createTask({ owner: 'freelancing-optimizer', title: `Create offer from ${taskLabel(task)}`, description: 'Create a gig/offer based on the validated and fact-checked opportunity.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'business-default' });
          tasks.push(next); updateRun('business-default', taskId, 'offer_creation', 'running', String(next.id), 'queued');
          appendEvent(buildEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Fact-check completion triggered freelancing-optimizer.' }));
        }
      } else if (blocked && !anyEventExists(events, newEvents, taskId, 'business-branch-paused-after-fact-check')) {
        updateRun('business-default', taskId, 'fact_checking', 'awaiting_approval', undefined, 'needs_approval');
        appendEvent(buildEvent({ timestamp: now(), event_type: 'approval_or_stop', source_task_id: taskId, source_agent: owner, action_taken: 'business-branch-paused-after-fact-check', created_task_id: null, notes: 'Fact-check result was outdated/blocked/incorrect.' }));
      }
    }

    if (owner === 'freelancing-optimizer' && !anyEventExists(events, newEvents, taskId, 'business-pipeline-complete')) {
      updateRun('business-default', taskId, 'offer_creation', 'completed', undefined, 'done');
      appendEvent(buildEvent({ timestamp: now(), event_type: 'pipeline_complete', source_task_id: taskId, source_agent: owner, action_taken: 'business-pipeline-complete', created_task_id: null, notes: 'Freelancing optimizer completed the business branch.' }));
    }
  }

  for (const task of failedTasks) {
    const owner = String(task.owner || '');
    const taskId = String(task.id || '');
    if (owner !== 'implementation-agent' || !taskId) continue;

    updateTaskOutputFiles(task, implementationArtifactsForTask(taskId));
    const runResultsRef = await loadRunResults(task);
    const runResults = runResultsRef.data;
    const executionAttempted = runResults?.executionAttempted === true;
    const success = runResults?.success === true;
    const failedCommand = runResults?.failedCommand?.command || runResults?.commands?.find((command) => command.status === 'failed')?.command || task.failureReason || 'unknown-command';
    const errorSummary = runResults?.errorSummary || task.failureReason || 'Implementation execution failed.';

    updateRun('development-default', String(task.context?.upstreamTaskId || taskId), 'implementation', 'failed', taskId, 'failed', {
      attempted: executionAttempted,
      success,
      failed_task_id: taskId,
      run_results_file: runResultsRef.relativePath,
      last_command: failedCommand || null,
    });

    if (executionAttempted && !success) {
      const action = 'auto-create-debugger-from-implementation-failure';
      if (!eventExists(events, taskId, action) && !debuggerDuplicateExists(tasks, taskId, String(failedCommand || ''))) {
        const next = createTask({
          owner: 'debugger-agent',
          title: `Debug implementation failure for ${taskLabel(task)}`,
          description: 'Investigate implementation execution failure and identify the root cause.',
          context: {
            derivedFrom: taskId,
            dependsOn: taskId,
            upstreamPlanTaskId: String(task.context?.upstreamTaskId || ''),
            failedCommand,
            errorSummary,
            runResultsFile: runResultsRef.relativePath,
            executionLogFile: artifactPath(taskId, 'execution-log.txt'),
            changedFilesFile: artifactPath(taskId, 'changed-files.json'),
            implementationSummaryFile: artifactPath(taskId, 'implementation-summary.md'),
          },
          sourceTaskId: taskId,
          pipeline: 'development-default',
        });
        tasks.push(next);
        updateRun('development-default', String(task.context?.upstreamTaskId || taskId), 'debugging', 'running', String(next.id), 'queued', {
          attempted: true,
          success: false,
          failed_task_id: taskId,
          run_results_file: runResultsRef.relativePath,
          last_command: String(failedCommand || ''),
        });
        appendEvent(buildEvent({ timestamp: now(), event_type: 'debugger_task_created_from_implementation_failure', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Implementation failure triggered debugger-agent with failure context.', metadata: { pipeline: 'development-default', upstreamTaskId: String(task.context?.upstreamTaskId || ''), runResultsFile: runResultsRef.relativePath, failedCommand: String(failedCommand || '') } }));
      }
    }
  }

  for (const task of approvalTasks) {
    const owner = String(task.owner || '');
    const taskId = String(task.id || '');
    if (owner !== 'implementation-agent' || !taskId) continue;
    if (!anyEventExists(events, newEvents, taskId, 'implementation-paused-for-approval')) {
      updateRun('development-default', String(task.context?.upstreamTaskId || taskId), 'implementation', 'awaiting_approval', taskId, 'needs_approval', {
        attempted: null,
        success: null,
        failed_task_id: null,
        run_results_file: String(task.context?.runResultsFile || '') || null,
        last_command: null,
      });
      appendEvent(buildEvent({ timestamp: now(), event_type: 'pipeline_paused_for_implementation_approval', source_task_id: taskId, source_agent: owner, action_taken: 'implementation-paused-for-approval', created_task_id: null, notes: 'Implementation task requested approval; downstream routing paused.', metadata: { pipeline: 'development-default', upstreamTaskId: String(task.context?.upstreamTaskId || '') } }));
    }
  }

  if (changed) {
    await sharedStore.writeTasks(tasks);
    await sharedStore.writeRuns({ ...(runsDoc || {}), version: 1, updatedAt: now(), runs });
    await sharedStore.writeEvents({ ...(eventsDoc || {}), version: 1, updatedAt: now(), events: [...events, ...newEvents] });
    const digest = await sharedStore.readDigest();
    const lines = [
      digest.trim(),
      '',
      '## Automation Sweep',
      ...newEvents.map((event) => `- ${event.timestamp}: ${event.action_taken}${event.created_task_id ? ` -> ${event.created_task_id}` : ''}`),
      '',
    ].join('\n');
    await sharedStore.writeDigest(lines);
  }

  return {
    changed,
    eventsCreated: newEvents.length,
    createdTaskIds: newEvents.map((event) => event.created_task_id).filter(Boolean),
  };
}
