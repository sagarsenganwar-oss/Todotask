import { getProjectTasks, getProjects, getTodayDate } from "@/lib/data";
import type { Project } from "@/lib/types";
import { AddTask } from "./add-task";
import { EmptyState } from "./empty-state";
import { ProjectHeader } from "./project-header";
import { TaskList } from "./task-list";

/** One project's page (also used for the Inbox). */
export async function ProjectView({ project }: { project: Project }) {
  const [projects, today, { open, completed }] = await Promise.all([
    getProjects(),
    getTodayDate(),
    getProjectTasks(project.id),
  ]);

  return (
    <>
      <ProjectHeader project={project} taskCount={open.length + completed.length} />

      <section aria-label="Open tasks">
        <TaskList
          tasks={open}
          projects={projects}
          today={today}
          empty={
            project.is_inbox ? (
              <EmptyState icon="📥" title="Your Inbox is empty">
                {completed.length > 0 ? "All done here! " : ""}Add a task below. New tasks go here unless you pick another project.
              </EmptyState>
            ) : (
              <EmptyState icon="📋" title={completed.length > 0 ? "All tasks done" : "No tasks yet"}>
                Add a task to this project below.
              </EmptyState>
            )
          }
        />
        <div className="border-t border-neutral-200 pt-2 dark:border-neutral-800">
          <AddTask projects={projects} defaultProjectId={project.id} />
        </div>
      </section>

      {completed.length > 0 && (
        <details className="rounded-xl border border-neutral-200 px-4 py-2 dark:border-neutral-800">
          <summary className="cursor-pointer py-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Completed ({completed.length})
          </summary>
          <TaskList tasks={completed} projects={projects} today={today} />
        </details>
      )}
    </>
  );
}
