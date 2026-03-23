# OpenClaw Dashboard

A local operational dashboard for a solo developer/freelancer running multiple OpenClaw agents.

## What it does

This dashboard reads directly from the local OpenClaw filesystem and provides:

- overview metrics
- agent status pages
- task queue monitoring
- task detail pages
- daily digest view
- routing map view
- alerts / attention center
- productivity / history metrics
- output explorer for agent workspaces
- safe file-backed manual task actions
- runtime trigger actions for orchestrator and agents
- local runtime trigger logs

## Data sources

The app reads directly from:

- `~/.openclaw/openclaw.json`
- `~/.openclaw/agents/`
- `~/.openclaw/shared/tasks.json`
- `~/.openclaw/shared/routing-map.json`
- `~/.openclaw/shared/digest.md`
- `~/.openclaw/cron/jobs.json` when present

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Node.js filesystem access via server components/server actions

## Folder structure

```text
openclaw-dashboard/
├─ src/app/
│  ├─ page.tsx
│  ├─ actions/page.tsx
│  ├─ agents/
│  ├─ alerts/page.tsx
│  ├─ digest/page.tsx
│  ├─ history/page.tsx
│  ├─ outputs/
│  ├─ routing/page.tsx
│  ├─ runtime-logs/page.tsx
│  └─ tasks/
├─ src/components/
│  ├─ files/
│  ├─ forms/
│  ├─ layout/
│  ├─ logs/
│  └─ ui/
├─ src/lib/
│  ├─ actions/
│  ├─ domain/
│  ├─ fs/
│  ├─ runtime/
│  └─ utils/
└─ runtime-logs/
```

## Setup

From the dashboard directory:

```bash
cd /home/jim/.openclaw/workspace-main/openclaw-dashboard
npm install
```

## Run in development

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## Production-style local run

```bash
npm run build
npm run start
```

## Environment variables

Optional:

```bash
OPENCLAW_HOME=/home/jim/.openclaw
```

If omitted, the app defaults to:

```bash
/home/jim/.openclaw
```

## Status inference rules

The dashboard uses explicit file-based heuristics because the current system does not yet expose a full structured runtime event stream.

Examples:

- if an agent has `needs_approval` tasks -> status becomes `needs approval`
- if it has `in_progress` tasks -> status becomes `running`
- if it has pending tasks but no recent movement -> `waiting` or `offline`
- if a task is `queued` or `in_progress` too long -> it is flagged as stalled
- if failure markers exist -> task is highlighted as failed
- if task text is materially identical -> it is flagged as a possible duplicate

## Real manual actions currently implemented

These actions modify `~/.openclaw/shared/tasks.json` directly:

- create task
- requeue task
- mark task as `needs_approval`

These runtime actions are also wired:

- trigger orchestrator
- trigger a specific agent

Runtime triggers use:

```bash
openclaw agent --agent <id> --message <text> --json
```

And log locally to:

- `runtime-logs/YYYY-MM-DD.jsonl`

## Known limitations

- no live websocket updates yet
- no in-browser streaming logs yet
- no toast/status feedback after form submission yet
- output explorer is practical but still basic
- OS-level "open workspace path" is not wired
- runtime visibility is still partly inferred from files/timestamps
- task schema is intentionally permissive because the queue may evolve
- no authentication layer is added because this is designed as a local tool first

## Suggested next improvements

- live refresh / polling for active runs
- direct session/runtime inspection if OpenClaw exposes richer APIs
- toast notifications for action results
- better digest rendering with extracted sections
- richer output preview types
- cron control UI
- more advanced duplicate detection
- agent/session log correlation

## Repository notes

This project lives inside:

- `/home/jim/.openclaw/workspace-main/openclaw-dashboard`

Your workspace git repo is already configured to auto-push on commit.
