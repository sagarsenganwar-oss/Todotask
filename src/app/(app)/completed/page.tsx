import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { TaskList } from "@/components/task-list";
import { getCompletedTasks, getProjects, getTodayDate } from "@/lib/data";

export const metadata: Metadata = { title: "Completed · Todotask" };

export default async function CompletedPage() {
  const [projects, today, tasks] = await Promise.all([getProjects(), getTodayDate(), getCompletedTasks()]);

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Completed</h1>
        <p className="text-sm text-neutral-500">Newest first. Click the circle to mark a task as not completed.</p>
      </div>
      <TaskList
        tasks={tasks}
        projects={projects}
        today={today}
        showProject
        empty={
          <EmptyState icon="✅" title="No completed tasks yet">
            When you tick the circle next to a task, it moves here.
          </EmptyState>
        }
      />
    </>
  );
}
