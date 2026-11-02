"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export type ProjectFormState =
  | { ok?: boolean; error?: string; name?: string; savedAt?: number }
  | undefined;
export type ProjectActionState = { error?: string } | undefined;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readName(formData: FormData) {
  // Collapse repeated spaces so "Work  " and "Work" count as the same name.
  return String(formData.get("name") ?? "").replace(/\s+/g, " ").trim();
}

function validateName(name: string): string | null {
  if (!name) return "Please enter a project name.";
  if (name.length > 100) return "The project name is too long (max 100 characters).";
  if (name.toLowerCase() === "inbox") return "\"Inbox\" is already used by your default project.";
  return null;
}

function dbError(step: string, error: { code?: string; message: string }): string {
  console.error(`[projects] ${step} failed:`, { code: error.code, message: error.message });
  if (error.message.includes("Inbox")) return "The Inbox cannot be renamed or deleted.";
  return "Could not save your change. Please try again.";
}

/** True when the user already has another project with this name. */
async function nameTaken(
  supabase: Awaited<ReturnType<typeof requireUser>>["supabase"],
  name: string,
  exceptId?: string,
) {
  const { data } = await supabase.from("projects").select("id, name");
  return (data ?? []).some((p) => p.id !== exceptId && p.name.toLowerCase() === name.toLowerCase());
}

export async function createProject(_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const { supabase, userId } = await requireUser();
  const name = readName(formData);
  const invalid = validateName(name);
  if (invalid) return { error: invalid, name };
  if (await nameTaken(supabase, name)) return { error: `You already have a project called "${name}".`, name };

  const { data, error } = await supabase
    .from("projects")
    .insert({ name, user_id: userId })
    .select("id")
    .single();
  if (error) return { error: dbError("create", error), name };

  revalidatePath("/", "layout");
  redirect(`/projects/${data.id}`);
}

export async function renameProject(_prev: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  const name = readName(formData);
  if (!UUID.test(id)) return { error: "This project could not be found.", name };
  const invalid = validateName(name);
  if (invalid) return { error: invalid, name };
  if (await nameTaken(supabase, name, id)) return { error: `You already have a project called "${name}".`, name };

  // The database trigger also blocks renaming the Inbox.
  const { data, error } = await supabase
    .from("projects")
    .update({ name })
    .eq("id", id)
    .eq("is_inbox", false)
    .select("id");
  if (error) return { error: dbError("rename", error), name };
  if (!data || data.length === 0) return { error: "This project cannot be renamed.", name };

  revalidatePath("/", "layout");
  return { ok: true, savedAt: Date.now() };
}

export async function deleteProject(_prev: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) return { error: "This project could not be found." };

  // RLS refuses to delete the Inbox; is_inbox=false makes that explicit.
  // The project's tasks are deleted with it (ON DELETE CASCADE).
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("is_inbox", false)
    .select("id");
  if (error) return { error: dbError("delete", error) };
  if (!data || data.length === 0) return { error: "This project cannot be deleted." };

  revalidatePath("/", "layout");
  redirect("/inbox");
}
