"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { TaskRow } from "@/components/tasks/task-row";
import { useLiveJson } from "@/hooks/use-live-json";
import { getTaskLabelView } from "@/lib/utils/task-view";
import type { TaskRecord } from "@/lib/types";

function isDuplicateCandidate(index: number, tasks: TaskRecord[]): boolean {
  const task = tasks[index];
  const basis = `${task.title || ""} ${task.description || ""}`.trim().toLowerCase();
  if (!basis) return false;
  return tasks.some((other, otherIndex) => {
    if (otherIndex === index) return false;
    const otherBasis = `${other.title || ""} ${other.description || ""}`.trim().toLowerCase();
    return otherBasis && otherBasis === basis && (other.status !== "done" || task.status !== "done");
  });
}

export function LiveTasksPage({ initialTasks, filteredTasks }: { initialTasks: TaskRecord[]; filteredTasks: TaskRecord[] }) {
  const { data, updatedAt } = useLiveJson<{ tasks: TaskRecord[]; updatedAt: string }>("/api/tasks", { tasks: initialTasks, updatedAt: new Date().toISOString() });
  const tasks = filteredTasks.length === initialTasks.length ? data.tasks || initialTasks : filteredTasks;

  return (
    <section className="rounded-2xl border border-white/8 bg-zinc-950/80 p-5">
      <SectionHeader title="Tasks" description={`${tasks.length} visible task(s) · live updated ${new Date(updatedAt).toLocaleTimeString()}`} />
      {tasks.length === 0 ? (
        <EmptyState title="No tasks found" description="The shared queue is empty or your current filters excluded all tasks." />
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskRow
              key={task.id || `${getTaskLabelView(task)}-${index}`}
              task={task}
              href={`/tasks/${task.id || `task-${index}`}`}
              duplicate={isDuplicateCandidate(index, tasks)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
