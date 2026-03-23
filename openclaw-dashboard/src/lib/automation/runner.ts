import { sharedStore, SharedAutomationRules, SharedEvent, SharedPipelineDef, SharedPipelineRun } from "@/lib/automation/store";

type Task = Record<string, unknown> & {
  id?: string;
  title?: string;
  description?: string;
  owner?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
  source?: string;
  context?: Record<string, unknown>;
  statusHistory?: Array<{ status: string; at: string; note?: string }>;
  outputFiles?: string[];
  failureReason?: string;
};

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

function createTask({ owner, title, description, context, sourceTaskId, pipeline }: { owner: string; title: string; description: string; context: Record<string, unknown>; sourceTaskId: string; pipeline: string; }): Task {
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
    statusHistory: [{ status: 'queued', at: timestamp, note: `Auto-created from ${sourceTaskId}.` }],
  };
}

function openTasks(tasks: Task[]) {
  return tasks.filter((task) => !['done', 'cancelled'].includes(String(task.status)));
}

function duplicateExists(tasks: Task[], owner: string, upstreamTaskId: string, pipeline: string) {
  return openTasks(tasks).some((task) => task.owner === owner && task.context?.upstreamTaskId === upstreamTaskId && task.context?.pipeline === pipeline);
}

function eventExists(events: SharedEvent[], sourceTaskId: string, actionTaken: string) {
  return events.some((event) => event.source_task_id === sourceTaskId && event.action_taken === actionTaken);
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

  function appendEvent(evt: SharedEvent) {
    newEvents.push(evt);
    changed = true;
  }

  function updateRun(pipelineName: string, sourceTaskId: string, currentStage: string, finalStatus = 'running', linkedTaskId?: string) {
    if (!enabledPipelines.has(pipelineName)) return;
    let run = runs.find((r) => r.pipeline_name === pipelineName && r.source_task_id === sourceTaskId);
    if (!run) {
      run = {
        run_id: `${pipelineName}-${Date.now()}`,
        pipeline_name: pipelineName,
        source_task_id: sourceTaskId,
        current_stage: currentStage,
        stage_status: 'active',
        linked_task_ids: linkedTaskId ? [linkedTaskId] : [sourceTaskId],
        started_at: now(),
        updated_at: now(),
        final_status: finalStatus,
      };
      runs.push(run);
    } else {
      run.current_stage = currentStage;
      run.updated_at = now();
      run.final_status = finalStatus;
      if (linkedTaskId && !run.linked_task_ids.includes(linkedTaskId)) run.linked_task_ids.push(linkedTaskId);
    }
    changed = true;
  }

  for (const task of doneTasks) {
    const owner = String(task.owner || '');
    const taskId = String(task.id || '');
    if (!taskId) continue;
    const outputsJoined = `${JSON.stringify(task.outputFiles || [])}\n${JSON.stringify(task.context || {})}\n${task.title || ''}\n${task.description || ''}`;

    if (owner === 'lead-developer') {
      const action = 'auto-create-feature-planner';
      if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'feature-planner', taskId, 'development-default')) {
        const next = createTask({ owner: 'feature-planner', title: `Plan follow-up for ${taskLabel(task)}`, description: 'Create a technical feature/task breakdown from the approved architecture decision.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
        tasks.push(next); updateRun('development-default', taskId, 'planning', 'running', String(next.id));
        appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Lead-developer completion triggered feature-planner.' });
      }
    }

    if (owner === 'feature-planner') {
      const action = 'auto-create-implementation-agent';
      if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'implementation-agent', taskId, 'development-default')) {
        const next = createTask({ owner: 'implementation-agent', title: `Implement planned work for ${taskLabel(task)}`, description: 'Implement the planned feature based on the completed feature-planning output.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
        tasks.push(next); updateRun('development-default', taskId, 'implementation', 'running', String(next.id));
        appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Feature-planner completion triggered implementation-agent.' });
      }
    }

    if (owner === 'implementation-agent') {
      const action = 'auto-create-review-agent';
      if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'review-agent', taskId, 'development-default')) {
        const next = createTask({ owner: 'review-agent', title: `Review implementation for ${taskLabel(task)}`, description: 'Review implementation output for bugs, edge cases, and acceptability.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
        tasks.push(next); updateRun('development-default', taskId, 'review', 'running', String(next.id));
        appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Implementation completion triggered review-agent.' });
      }
    }

    if (owner === 'review-agent') {
      const pass = hasMarker(outputsJoined, positive) || !hasMarker(outputsJoined, negative);
      const fail = hasMarker(outputsJoined, ['FAIL', 'NEEDS FIX', 'CRITICAL']);
      if (fail) {
        const action = 'auto-create-debugger-agent';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'debugger-agent', taskId, 'development-default')) {
          const next = createTask({ owner: 'debugger-agent', title: `Debug follow-up for ${taskLabel(task)}`, description: 'Investigate failed review findings and produce a root cause + fix recommendation.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
          tasks.push(next); updateRun('development-default', taskId, 'debugging', 'running', String(next.id));
          appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Review failure routed to debugger-agent.' });
        }
      } else if (pass) {
        const action = 'auto-create-ops-agent';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'ops-agent', taskId, 'development-default')) {
          const next = createTask({ owner: 'ops-agent', title: `Operational follow-up for ${taskLabel(task)}`, description: 'Inspect operational/usage impact after a successful review.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
          tasks.push(next); updateRun('development-default', taskId, 'operations', 'running', String(next.id));
          appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Review pass triggered ops-agent.' });
        }
      }
    }

    if (owner === 'debugger-agent') {
      const action = 'auto-create-implementation-followup';
      if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'implementation-agent', taskId, 'development-default')) {
        const next = createTask({ owner: 'implementation-agent', title: `Implementation follow-up for ${taskLabel(task)}`, description: 'Apply debugger findings and recommended fixes.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
        tasks.push(next); updateRun('development-default', taskId, 'implementation', 'running', String(next.id));
        appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Debugger completion triggered implementation follow-up.' });
      }
    }

    if (owner === 'ops-agent') {
      const issue = hasMarker(outputsJoined, ['ISSUE', 'ERROR', 'WARNING', 'ALERT']);
      if (issue) {
        const action = 'auto-create-debugger-from-ops';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'debugger-agent', taskId, 'development-default')) {
          const next = createTask({ owner: 'debugger-agent', title: `Investigate operational issue from ${taskLabel(task)}`, description: 'Inspect operational findings and produce debugging guidance.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'development-default' });
          tasks.push(next); updateRun('development-default', taskId, 'debugging', 'running', String(next.id));
          appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Ops findings triggered debugger-agent.' });
        }
      } else {
        updateRun('development-default', taskId, 'operations', 'healthy');
        appendEvent({ timestamp: now(), event_type: 'pipeline_healthy', source_task_id: taskId, source_agent: owner, action_taken: 'development-pipeline-healthy', created_task_id: null, notes: 'Ops-agent completed without operational issues.' });
      }
    }

    if (owner === 'niche-scout') {
      const action = 'auto-create-validation-agent';
      if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'validation-agent', taskId, 'business-default')) {
        const next = createTask({ owner: 'validation-agent', title: `Validate opportunity from ${taskLabel(task)}`, description: 'Validate the strongest monetizable niche discovered by niche-scout.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'business-default' });
        tasks.push(next); updateRun('business-default', taskId, 'validation', 'running', String(next.id));
        appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Niche-scout completion triggered validation-agent.' });
      }
    }

    if (owner === 'validation-agent') {
      const viable = hasMarker(outputsJoined, ['BUILD', 'STRONG', 'VIABLE']);
      const weak = hasMarker(outputsJoined, ['SKIP', 'WEAK', 'NOT VIABLE']);
      if (viable) {
        const action = 'auto-create-fact-checker';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'fact-checker', taskId, 'business-default')) {
          const next = createTask({ owner: 'fact-checker', title: `Fact-check validated opportunity from ${taskLabel(task)}`, description: 'Verify assumptions and claims for the validated business opportunity.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'business-default' });
          tasks.push(next); updateRun('business-default', taskId, 'fact_checking', 'running', String(next.id));
          appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Validation verdict triggered fact-checker.' });
        }
      } else if (weak) {
        updateRun('business-default', taskId, 'validation', 'stopped');
        appendEvent({ timestamp: now(), event_type: 'pipeline_stop', source_task_id: taskId, source_agent: owner, action_taken: 'business-pipeline-stopped-after-validation', created_task_id: null, notes: 'Validation result was weak/skip, so the branch was stopped.' });
      }
    }

    if (owner === 'fact-checker') {
      const valid = hasMarker(outputsJoined, ['VALID', 'CONFIRMED', 'FEASIBLE']);
      const blocked = hasMarker(outputsJoined, ['OUTDATED', 'BLOCKED', 'INCORRECT']);
      if (valid) {
        const action = 'auto-create-freelancing-optimizer';
        if (!eventExists(events, taskId, action) && !duplicateExists(tasks, 'freelancing-optimizer', taskId, 'business-default')) {
          const next = createTask({ owner: 'freelancing-optimizer', title: `Create offer from ${taskLabel(task)}`, description: 'Create a gig/offer based on the validated and fact-checked opportunity.', context: { derivedFrom: taskId, priorOutputs: getNewestOutputFiles(task) }, sourceTaskId: taskId, pipeline: 'business-default' });
          tasks.push(next); updateRun('business-default', taskId, 'offer_creation', 'running', String(next.id));
          appendEvent({ timestamp: now(), event_type: 'auto_trigger', source_task_id: taskId, source_agent: owner, action_taken: action, created_task_id: String(next.id), notes: 'Fact-check completion triggered freelancing-optimizer.' });
        }
      } else if (blocked) {
        updateRun('business-default', taskId, 'fact_checking', 'waiting_approval');
        appendEvent({ timestamp: now(), event_type: 'approval_or_stop', source_task_id: taskId, source_agent: owner, action_taken: 'business-branch-paused-after-fact-check', created_task_id: null, notes: 'Fact-check result was outdated/blocked/incorrect.' });
      }
    }

    if (owner === 'freelancing-optimizer') {
      updateRun('business-default', taskId, 'offer_creation', 'completed');
      appendEvent({ timestamp: now(), event_type: 'pipeline_complete', source_task_id: taskId, source_agent: owner, action_taken: 'business-pipeline-complete', created_task_id: null, notes: 'Freelancing optimizer completed the business branch.' });
    }
  }

  if (changed) {
    await sharedStore.writeTasks(tasks);
    await sharedStore.writeRuns({ version: 1, updatedAt: now(), runs });
    await sharedStore.writeEvents({ version: 1, updatedAt: now(), events: [...events, ...newEvents] });
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
