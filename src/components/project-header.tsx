"use client";

import { useActionState, useState } from "react";
import type { Project } from "@/lib/types";
import {
  deleteProject,
  renameProject,
  type ProjectActionState,
  type ProjectFormState,
} from "@/app/projects/actions";

/** Project title with Rename and Delete (not shown for the Inbox). */
export function ProjectHeader({ project, taskCount }: { project: Project; taskCount: number }) {
  const [mode, setMode] = useState<"view" | "rename" | "delete">("view");
  const [renameState, renameAction, renaming] = useActionState<ProjectFormState, FormData>(
    async (prev, formData) => {
      const result = await renameProject(prev, formData);
      if (result?.ok) setMode("view"); // close the form after a successful rename
      return result;
    },
    undefined,
  );
  const [deleteState, deleteAction, deleting] = useActionState<ProjectActionState, FormData>(deleteProject, undefined);

  if (mode === "rename") {
    return (
      <form action={renameAction} className="flex flex-col gap-2" noValidate>
        <input type="hidden" name="id" value={project.id} />
        <label htmlFor="rename-project" className="text-xs font-medium text-neutral-500">
          Project name
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            key={renameState?.error ?? "rename"}
            id="rename-project"
            name="name"
            defaultValue={renameState?.name ?? project.name}
            maxLength={100}
            autoFocus
            className="min-w-0 flex-1 rounded-md border border-neutral-300 bg-transparent px-3 py-1.5 text-xl font-bold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700"
          />
          <button
            type="button"
            onClick={() => setMode("view")}
            className="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={renaming}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {renaming ? "Saving…" : "Save"}
          </button>
        </div>
        {renameState?.error && (
          <p role="alert" className="text-sm text-red-600">
            {renameState.error}
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="min-w-0 break-words text-2xl font-bold">{project.name}</h1>
        {!project.is_inbox && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMode("rename")}
              className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => setMode("delete")}
              className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {mode === "delete" && (
        <div className="flex flex-col gap-2 rounded-md bg-red-50 p-3 text-sm dark:bg-red-950">
          <p className="text-red-800 dark:text-red-200">
            Delete <strong>{project.name}</strong>
            {taskCount > 0
              ? ` and its ${taskCount} task${taskCount === 1 ? "" : "s"}`
              : ""}
            ? This cannot be undone.
          </p>
          <form action={deleteAction} className="flex gap-2">
            <input type="hidden" name="id" value={project.id} />
            <button
              type="submit"
              disabled={deleting}
              className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              {deleting ? "Deleting…" : "Delete project"}
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-md px-3 py-1.5 font-medium hover:bg-white dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
          </form>
          {deleteState?.error && (
            <p role="alert" className="text-red-700 dark:text-red-300">
              {deleteState.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
