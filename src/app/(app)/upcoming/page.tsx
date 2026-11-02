import type { Metadata } from "next";
import { AddTask } from "@/components/add-task";
import { TaskList } from "@/components/task-list";
import { getProjects, getTodayDate, getUpcomingTasks } from "@/lib/data";
import { dueLabel } from "@/lib/dates";

export const metadata: Metadata = { title: "Upcoming · Todotask" };

function longDate(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

export default async function UpcomingPage() {
  const [projects, today, groups] = await Promise.all([getProjects(), getTodayDate(), getUpcomingTasks()]);
  const inbox = projects.find((p) => p.is_inbox)!;

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold">Upcoming</h1>
        <p className="text-sm text-neutral-500">Tasks due in the next 7 days</p>
      </div>

      {groups.map(({ day, tasks }) => {
        const label = dueLabel(day, today);
        const relative = label === "Today" || label === "Tomorrow";
        return (
          <section key={day} aria-labelledby={`day-${day}`}>
            <h2 id={`day-${day}`} className="border-b border-neutral-200 pb-1 text-sm font-semibold dark:border-neutral-800">
              {relative ? `${label} · ${longDate(day)}` : longDate(day)}
              <span className="ml-2 font-normal text-neutral-500">{tasks.length > 0 ? tasks.length : ""}</span>
            </h2>
            <TaskList tasks={tasks} projects={projects} today={today} showProject emptyText="No tasks." />
            <AddTask projects={projects} defaultProjectId={inbox.id} defaultDueDate={day} />
          </section>
        );
      })}
    </>
  );
}
