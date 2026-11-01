import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getToday } from "@/lib/timezone";
import { TASK_COLUMNS, type Project, type Task } from "@/lib/types";
import { AddTask } from "@/components/add-task";
import { TaskItem } from "@/components/task-item";
import { logout } from "../auth-actions";

export const metadata: Metadata = { title: "Inbox · Todotask" };

export default async function InboxPage() {
  // Server-side session check before any private data is read.
  const { supabase, email } = await requireUser();
  const today = await getToday();

  // Row Level Security makes sure these only return the user's own rows.
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, is_inbox")
    .order("created_at")
    .returns<Project[]>();

  const inbox = projects?.find((p) => p.is_inbox);

  const { data: tasks, error: tasksError } = inbox
    ? await supabase
        .from("tasks")
        .select(TASK_COLUMNS)
        .eq("project_id", inbox.id)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("priority", { ascending: true })
        .order("created_at", { ascending: true })
        .returns<Task[]>()
    : { data: [] as Task[], error: null };

  const open = (tasks ?? []).filter((t) => !t.completed_at);
  const completed = (tasks ?? [])
    .filter((t) => t.completed_at)
    .sort((a, b) => (b.completed_at! > a.completed_at! ? 1 : -1));
  const loadError = projectsError || tasksError || !inbox;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inbox</h1>
          <p className="text-sm text-neutral-500">
            Logged in as <span className="font-medium text-neutral-700 dark:text-neutral-300">{email}</span>
          </p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Log out
          </button>
        </form>
      </header>

      {loadError ? (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          Could not load your tasks. Please refresh the page.
        </p>
      ) : (
        <>
          <section aria-label="Open tasks">
            {open.length > 0 ? (
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {open.map((task) => (
                  <TaskItem key={task.id} task={task} projects={projects!} today={today} />
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-neutral-500">No open tasks. Add one below.</p>
            )}
            <div className="border-t border-neutral-200 pt-2 dark:border-neutral-800">
              <AddTask projects={projects!} defaultProjectId={inbox.id} />
            </div>
          </section>

          {completed.length > 0 && (
            <details className="rounded-xl border border-neutral-200 px-4 py-2 dark:border-neutral-800">
              <summary className="cursor-pointer py-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Completed ({completed.length})
              </summary>
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {completed.map((task) => (
                  <TaskItem key={task.id} task={task} projects={projects!} today={today} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </main>
  );
}
