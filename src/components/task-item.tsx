"use client";

import { useActionState, useCallback, useState } from "react";
import { dueLabel } from "@/lib/dates";
import type { Project, Task } from "@/lib/types";
import { deleteTask, setTaskCompleted, type TaskActionState } from "@/app/tasks/actions";
import { TaskForm } from "./task-form";

const PRIORITY_STYLE: Record<number, { ring: string; text: string }> = {
  1: { ring: "border-red-600 bg-red-50 dark:bg-red-950", text: "text-red-600" },
  2: { ring: "border-orange-500 bg-orange-50 dark:bg-orange-950", text: "text-orange-500" },
  3: { ring: "border-blue-500 bg-blue-50 dark:bg-blue-950", text: "text-blue-500" },
  4: { ring: "border-neutral-400", text: "text-neutral-500" },
};

type Props = {
  task: Task;
  projects: Project[];
  today: string;
  /** Show the project name (used in views that mix projects). */
  showProject?: boolean;
};

export function TaskItem({ task, projects, today, showProject = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toggleState, toggleAction, toggling] = useActionState<TaskActionState, FormData>(setTaskCompleted, undefined);
  const [deleteState, deleteAction, deleting] = useActionState<TaskActionState, FormData>(deleteTask, undefined);
  const closeEditor = useCallback(() => setEditing(false), []);

  const done = Boolean(task.completed_at);
  const style = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE[4];
  const overdue = !done && task.due_date !== null && task.due_date < today;
  const projectName = projects.find((p) => p.id === task.project_id)?.name;
  const error = toggleState?.error ?? deleteState?.error;

  if (editing) {
    return (
      <li className="py-2">
        <TaskForm projects={projects} defaultProjectId={task.project_id} task={task} onClose={closeEditor} />
      </li>
    );
  }

  return (
    <li className={`group flex items-start gap-3 py-3 ${toggling || deleting ? "opacity-50" : ""}`}>
      <form action={toggleAction}>
        <input type="hidden" name="id" value={task.id} />
        <input type="hidden" name="completed" value={done ? "0" : "1"} />
        <button
          type="submit"
          disabled={toggling}
          aria-label={done ? `Mark "${task.title}" as not completed` : `Complete "${task.title}"`}
          title={done ? "Mark as not completed" : "Complete"}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${style.ring} ${done ? "bg-neutral-400! border-neutral-400!" : ""}`}
        >
          {done && (
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" aria-hidden="true">
              <path fill="none" stroke="currentColor" strokeWidth="2.5" d="M3 8.5l3 3 7-7" />
            </svg>
          )}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <p className={`break-words text-sm ${done ? "text-neutral-500 line-through" : ""}`}>{task.title}</p>
        {task.description && (
          <p className="mt-0.5 line-clamp-2 whitespace-pre-line break-words text-xs text-neutral-500">
            {task.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {task.due_date && (
            <span className={overdue ? "font-medium text-red-600" : "text-green-700 dark:text-green-500"}>
              📅 {dueLabel(task.due_date, today)}
            </span>
          )}
          {task.priority < 4 && <span className={`font-medium ${style.text}`}>P{task.priority}</span>}
          {showProject && projectName && <span className="text-neutral-500"># {projectName}</span>}
        </div>
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
        {confirmDelete && (
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-xs dark:bg-red-950">
            <span className="text-red-700 dark:text-red-300">Delete this task? This cannot be undone.</span>
            <form action={deleteAction} className="flex gap-2">
              <input type="hidden" name="id" value={task.id} />
              <button
                type="submit"
                disabled={deleting}
                className="rounded bg-red-600 px-2 py-1 font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded px-2 py-1 font-medium text-neutral-700 hover:bg-white dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="flex shrink-0 gap-1 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        {!done && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit "${task.title}"`}
            title="Edit"
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
              <path fill="currentColor" d="M14.7 2.3a1 1 0 0 1 1.4 0l1.6 1.6a1 1 0 0 1 0 1.4L7.4 15.6 3 17l1.4-4.4L14.7 2.3z" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label={`Delete "${task.title}"`}
          title="Delete"
          className="rounded p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <path fill="currentColor" d="M7 2h6l1 2h4v2H2V4h4l1-2zm-3 6h12l-1 10H5L4 8z" />
          </svg>
        </button>
      </div>
    </li>
  );
}
