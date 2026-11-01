"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isValidIsoDate } from "@/lib/dates";

/** The values a task form sends. Kept as text so the form can show them again. */
export type TaskFormValues = {
  title: string;
  description: string;
  due_date: string;
  priority: string;
  project_id: string;
};

export type TaskFormState =
  | { ok?: boolean; error?: string; values?: TaskFormValues; savedAt?: number }
  | undefined;

export type TaskActionState = { error?: string } | undefined;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readValues(formData: FormData): TaskFormValues {
  const text = (name: string) => String(formData.get(name) ?? "");
  return {
    title: text("title").trim(),
    description: text("description").trim(),
    due_date: text("due_date").trim(),
    priority: text("priority").trim() || "4",
    project_id: text("project_id").trim(),
  };
}

/** Returns an error sentence, or null when the values are fine. */
function validate(v: TaskFormValues): string | null {
  if (!v.title) return "Please enter a task name.";
  if (v.title.length > 500) return "The task name is too long (max 500 characters).";
  if (v.description.length > 5000) return "The description is too long (max 5000 characters).";
  if (v.due_date && !isValidIsoDate(v.due_date)) return "Please choose a valid due date.";
  if (!["1", "2", "3", "4"].includes(v.priority)) return "Please choose a priority from P1 to P4.";
  if (!UUID.test(v.project_id)) return "Please choose a project.";
  return null;
}

function toRow(v: TaskFormValues) {
  return {
    title: v.title,
    description: v.description || null,
    due_date: v.due_date || null,
    priority: Number(v.priority),
    project_id: v.project_id,
  };
}

/** Logs the real database error and returns a clear sentence for the user. */
function dbError(step: string, error: { code?: string; message: string }): string {
  console.error(`[tasks] ${step} failed:`, { code: error.code, message: error.message });
  if (error.code === "23503") return "That project no longer exists. Please choose another project.";
  if (error.code === "23514") return "Some values are not allowed. Please check the task and try again.";
  return "Could not save your change. Please try again.";
}

function refreshViews() {
  // Refresh every page under "/" so all views show the change.
  revalidatePath("/", "layout");
}

export async function createTask(_prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const { supabase, userId } = await requireUser();
  const values = readValues(formData);
  const invalid = validate(values);
  if (invalid) return { error: invalid, values };

  const { error } = await supabase.from("tasks").insert({ ...toRow(values), user_id: userId });
  if (error) return { error: dbError("create", error), values };

  refreshViews();
  return { ok: true, savedAt: Date.now() };
}

export async function updateTask(_prev: TaskFormState, formData: FormData): Promise<TaskFormState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const values = readValues(formData);
  if (!UUID.test(id)) return { error: "This task could not be found.", values };
  const invalid = validate(values);
  if (invalid) return { error: invalid, values };

  // RLS makes sure only the owner's task can match this id.
  const { data, error } = await supabase
    .from("tasks")
    .update(toRow(values))
    .eq("id", id)
    .select("id");
  if (error) return { error: dbError("update", error), values };
  if (!data || data.length === 0) return { error: "This task no longer exists.", values };

  refreshViews();
  return { ok: true, savedAt: Date.now() };
}

export async function setTaskCompleted(_prev: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const completed = formData.get("completed") === "1";
  if (!UUID.test(id)) return { error: "This task could not be found." };

  const { data, error } = await supabase
    .from("tasks")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("id", id)
    .select("id");
  if (error) return { error: dbError("complete", error) };
  if (!data || data.length === 0) return { error: "This task no longer exists." };

  refreshViews();
  return undefined;
}

export async function deleteTask(_prev: TaskActionState, formData: FormData): Promise<TaskActionState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "This task could not be found." };

  const { data, error } = await supabase.from("tasks").delete().eq("id", id).select("id");
  if (error) return { error: dbError("delete", error) };
  if (!data || data.length === 0) return { error: "This task no longer exists." };

  refreshViews();
  return undefined;
}
