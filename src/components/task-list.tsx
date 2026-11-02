import type { Project, Task } from "@/lib/types";
import { TaskItem } from "./task-item";

type Props = {
  tasks: Task[];
  projects: Project[];
  today: string;
  showProject?: boolean;
  /** Text shown when there are no tasks. Leave empty to show nothing. */
  emptyText?: string;
};

export function TaskList({ tasks, projects, today, showProject = false, emptyText }: Props) {
  if (tasks.length === 0) {
    return emptyText ? <p className="py-4 text-center text-sm text-neutral-500">{emptyText}</p> : null;
  }
  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} projects={projects} today={today} showProject={showProject} />
      ))}
    </ul>
  );
}
