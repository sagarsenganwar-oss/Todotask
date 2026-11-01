export type Project = {
  id: string;
  name: string;
  is_inbox: boolean;
};

export type Task = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null; // "YYYY-MM-DD"
  priority: 1 | 2 | 3 | 4;
  completed_at: string | null;
  created_at: string;
};

/** The columns we read for a task, in one place. */
export const TASK_COLUMNS =
  "id, project_id, title, description, due_date, priority, completed_at, created_at";
