"use client";

import { useCallback, useState } from "react";
import type { Project } from "@/lib/types";
import { TaskForm } from "./task-form";

/** The "+ Add task" button that opens the new-task form. */
export function AddTask({ projects, defaultProjectId }: { projects: Project[]; defaultProjectId: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (open) {
    return <TaskForm projects={projects} defaultProjectId={defaultProjectId} onClose={close} />;
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="group flex w-full items-center gap-2 rounded-md py-2 text-left text-sm text-neutral-500 hover:text-red-600"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full text-lg leading-none text-red-600 group-hover:bg-red-600 group-hover:text-white">
        +
      </span>
      Add task
    </button>
  );
}
