"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Project, Task } from "@/lib/types";
import {
  createTask,
  updateTask,
  type TaskFormState,
  type TaskFormValues,
} from "@/app/tasks/actions";

type Props = {
  projects: Project[];
  /** Project selected for a new task. */
  defaultProjectId: string;
  /** When given, the form edits this task instead of creating one. */
  task?: Task;
  /** Called after a successful save or when the user clicks Cancel. */
  onClose?: () => void;
};

const inputClass =
  "w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-base outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700";

export function TaskForm({ projects, defaultProjectId, task, onClose }: Props) {
  const isEdit = Boolean(task);
  const [state, formAction, pending] = useActionState<TaskFormState, FormData>(
    isEdit ? updateTask : createTask,
    undefined,
  );
  const titleRef = useRef<HTMLInputElement>(null);

  // After a successful save: close the edit form, or keep the add form open
  // and put the cursor back in the title so the next task is quick to add.
  useEffect(() => {
    if (!state?.ok) return;
    if (isEdit) onClose?.();
    else titleRef.current?.focus();
  }, [state, isEdit, onClose]);

  // Values to show: what the user typed (after an error), else the task.
  const v: TaskFormValues = state?.values ?? {
    title: task?.title ?? "",
    description: task?.description ?? "",
    due_date: task?.due_date ?? "",
    priority: String(task?.priority ?? 4),
    project_id: task?.project_id ?? defaultProjectId,
  };
  // A new key makes React re-create the fields with the values above.
  const fieldsKey = `${state?.savedAt ?? 0}-${state?.error ?? ""}`;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-neutral-300 bg-white p-3 shadow-sm dark:border-neutral-700 dark:bg-neutral-900"
      noValidate
    >
      {task && <input type="hidden" name="id" value={task.id} />}
      <div key={fieldsKey} className="flex flex-col gap-3">
        <label className="sr-only" htmlFor={`title-${task?.id ?? "new"}`}>Task name</label>
        <input
          ref={titleRef}
          id={`title-${task?.id ?? "new"}`}
          name="title"
          defaultValue={v.title}
          placeholder="Task name"
          maxLength={500}
          required
          autoFocus
          className={`${inputClass} font-medium`}
        />
        <label className="sr-only" htmlFor={`desc-${task?.id ?? "new"}`}>Description</label>
        <textarea
          id={`desc-${task?.id ?? "new"}`}
          name="description"
          defaultValue={v.description}
          placeholder="Description (optional)"
          rows={2}
          maxLength={5000}
          className={`${inputClass} text-sm`}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Due date
            <input type="date" name="due_date" defaultValue={v.due_date} className={`${inputClass} text-sm`} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Priority
            <select name="priority" defaultValue={v.priority} className={`${inputClass} text-sm`}>
              <option value="1">P1 (urgent)</option>
              <option value="2">P2 (high)</option>
              <option value="3">P3 (medium)</option>
              <option value="4">P4 (none)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Project
            <select name="project_id" defaultValue={v.project_id} className={`${inputClass} text-sm`}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Saving…" : isEdit ? "Save" : "Add task"}
        </button>
      </div>
    </form>
  );
}
