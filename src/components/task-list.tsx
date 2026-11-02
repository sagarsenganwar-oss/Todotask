import type { ReactNode } from "react";
import type { Project, Task } from "@/lib/types";
import { TaskItem } from "./task-item";

type Props = {
  tasks: Task[];
  projects: Project[];
  today: string;
  showProject?: boolean;
  /** Shown when there are no tasks: short text or an EmptyState. Leave out to show nothing. */
  empty?: ReactNode;
};

export function TaskList({ tasks, projects, today, showProject = false, empty }: Props) {
  if (tasks.length === 0) {
    if (typeof empty === "string") return <p className="py-3 text-sm text-neutral-500">{empty}</p>;
    return empty ?? null;
  }
  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} projects={projects} today={today} showProject={showProject} />
      ))}
    </ul>
  );
}
