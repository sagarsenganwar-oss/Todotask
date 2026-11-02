import "server-only";
import { cache } from "react";
import { requireUser } from "./auth";
import { addDays } from "./dates";
import { getToday } from "./timezone";
import { TASK_COLUMNS, type Project, type Task } from "./types";

/**
 * Data helpers for pages. `cache` makes each one run only once per request,
 * even when the layout and the page both call it.
 * Every query runs as the logged-in user, so Row Level Security only
 * returns that user's own rows.
 */

export const getUser = cache(requireUser);
export const getTodayDate = cache(getToday);

export const getProjects = cache(async (): Promise<Project[]> => {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, is_inbox")
    .order("is_inbox", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[data] projects failed:", error.message);
    throw new Error("Could not load your projects.");
  }
  return data as Project[];
});

/** Number of open tasks per project, and how many are due today or overdue. */
export const getOpenCounts = cache(async () => {
  const { supabase } = await getUser();
  const today = await getTodayDate();
  const { data, error } = await supabase
    .from("tasks")
    .select("project_id, due_date")
    .is("completed_at", null);
  if (error) {
    console.error("[data] counts failed:", error.message);
    return { byProject: {} as Record<string, number>, today: 0 };
  }
  const byProject: Record<string, number> = {};
  let dueToday = 0;
  for (const t of data) {
    byProject[t.project_id] = (byProject[t.project_id] ?? 0) + 1;
    if (t.due_date && t.due_date <= today) dueToday++;
  }
  return { byProject, today: dueToday };
});

function failed(step: string, message: string): never {
  console.error(`[data] ${step} failed:`, message);
  throw new Error("Could not load your tasks.");
}

/** A project's tasks. Open ones are sorted by due date (no date last), priority, age. */
export async function getProjectTasks(projectId: string) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .eq("project_id", projectId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) failed("project tasks", error.message);
  const tasks = data as Task[];
  return {
    open: tasks.filter((t) => !t.completed_at),
    completed: tasks
      .filter((t) => t.completed_at)
      .sort((a, b) => (b.completed_at! > a.completed_at! ? 1 : -1)),
  };
}

/** Open tasks due today or earlier. */
export async function getTodayTasks() {
  const { supabase } = await getUser();
  const today = await getTodayDate();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .is("completed_at", null)
    .lte("due_date", today)
    .order("due_date", { ascending: true })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) failed("today tasks", error.message);
  const tasks = data as Task[];
  return {
    overdue: tasks.filter((t) => t.due_date! < today),
    today: tasks.filter((t) => t.due_date === today),
  };
}

/** Open tasks due in the next 7 days (today + 6), grouped by day. */
export async function getUpcomingTasks() {
  const { supabase } = await getUser();
  const today = await getTodayDate();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .is("completed_at", null)
    .gte("due_date", days[0])
    .lte("due_date", days[6])
    .order("priority", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) failed("upcoming tasks", error.message);
  const tasks = data as Task[];
  return days.map((day) => ({ day, tasks: tasks.filter((t) => t.due_date === day) }));
}

/** The most recently completed tasks. */
export async function getCompletedTasks(limit = 200) {
  const { supabase } = await getUser();
  const { data, error } = await supabase
    .from("tasks")
    .select(TASK_COLUMNS)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(limit);
  if (error) failed("completed tasks", error.message);
  return data as Task[];
}
