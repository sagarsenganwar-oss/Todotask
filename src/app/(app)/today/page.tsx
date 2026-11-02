import type { Metadata } from "next";
import { AddTask } from "@/components/add-task";
import { TaskList } from "@/components/task-list";
import { getProjects, getTodayDate, getTodayTasks } from "@/lib/data";
import { dueLabel } from "@/lib/dates";

export const metadata: Metadata = { title: "Today · Todotask" };

export default async function TodayPage() {
  const [projects, today, { overdue, today: dueToday }] = await Promise.all([
    getProjects(),
    getTodayDate(),
    getTodayTasks(),
  ]);
  const inbox = projects.find((p) => p.is_inbox)!;
  const nothing = overdue.length === 0 && dueToday.length === 0;

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Today</h1>
        <p className="text-sm text-neutral-500">{new Date(`${today}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {overdue.length > 0 && (
        <section aria-labelledby="overdue-heading">
          <h2 id="overdue-heading" className="border-b border-neutral-200 pb-1 text-sm font-semibold text-red-600 dark:border-neutral-800">
            Overdue ({overdue.length})
          </h2>
          <TaskList tasks={overdue} projects={projects} today={today} showProject />
        </section>
      )}

      <section aria-labelledby="today-heading">
        <h2 id="today-heading" className="border-b border-neutral-200 pb-1 text-sm font-semibold dark:border-neutral-800">
          {dueLabel(today, today)} ({dueToday.length})
        </h2>
        <TaskList
          tasks={dueToday}
          projects={projects}
          today={today}
          showProject
          emptyText={nothing ? "Nothing due today. Enjoy your day! 🎉" : "Nothing else due today."}
        />
        <div className="border-t border-neutral-200 pt-2 dark:border-neutral-800">
          <AddTask projects={projects} defaultProjectId={inbox.id} defaultDueDate={today} />
        </div>
      </section>
    </>
  );
}
