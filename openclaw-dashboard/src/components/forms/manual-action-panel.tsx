import { createTaskAction, markApprovalAction, requeueTaskAction } from "@/lib/actions/tasks";

export function ManualActionPanel({
  agentOptions = [],
  taskOptions = [],
}: {
  agentOptions?: string[];
  taskOptions?: Array<{ id: string; label: string }>;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-white/15 bg-zinc-900 p-5">
        <h2 className="text-lg font-semibold text-zinc-50">Runtime controls</h2>
        <p className="mt-2 text-sm text-zinc-400">
          These remain explicit placeholders for now. They are visible so the operational shape is there, but they are not pretending to execute live runtime actions yet.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["Trigger orchestrator", "Stub only in this version"],
            ["Trigger agent manually", "Stub only in this version"],
            ["Open workspace path", "UI placeholder; OS integration not wired"],
          ].map(([label, note]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="font-medium text-zinc-100">{label}</div>
              <div className="mt-1 text-sm text-zinc-500">{note}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <form action={createTaskAction} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <h3 className="text-lg font-semibold text-zinc-50">Create task</h3>
          <div className="mt-4 space-y-3">
            <input name="title" placeholder="Task title" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
            <textarea name="description" placeholder="Task description" rows={4} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
            <select name="owner" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
              <option value="">Unassigned</option>
              {agentOptions.map((agent) => <option key={agent} value={agent}>{agent}</option>)}
            </select>
            <select name="priority" defaultValue="medium" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input name="context" placeholder="Optional context" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
            <button type="submit" className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Create task</button>
          </div>
        </form>

        <form action={requeueTaskAction} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <h3 className="text-lg font-semibold text-zinc-50">Requeue task</h3>
          <div className="mt-4 space-y-3">
            <select name="taskId" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
              <option value="">Select task</option>
              {taskOptions.map((task) => <option key={task.id} value={task.id}>{task.label}</option>)}
            </select>
            <button type="submit" className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Requeue</button>
          </div>
        </form>

        <form action={markApprovalAction} className="rounded-2xl border border-white/10 bg-zinc-900 p-5">
          <h3 className="text-lg font-semibold text-zinc-50">Mark needs approval</h3>
          <div className="mt-4 space-y-3">
            <select name="taskId" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none">
              <option value="">Select task</option>
              {taskOptions.map((task) => <option key={task.id} value={task.id}>{task.label}</option>)}
            </select>
            <textarea name="reason" placeholder="Reason for approval review" rows={4} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500" />
            <button type="submit" className="rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900">Mark for approval</button>
          </div>
        </form>
      </div>
    </div>
  );
}
