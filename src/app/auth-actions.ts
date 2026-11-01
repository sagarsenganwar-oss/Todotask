"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** `email` is sent back so the form can keep it filled in after an error. */
export type AuthFormState = { error?: string; message?: string; email?: string } | undefined;

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  return { email, password };
}

function validate(email: string, password: string): string | null {
  if (!email || !password) return "Please enter your email and password.";
  // name@domain.tld — no spaces, and no empty parts such as a dot at the end.
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) return "Please enter a valid email address.";
  if (password.length < 6) return "The password must have at least 6 characters.";
  return null;
}

/**
 * Writes the real error to the server log (never shown to the user, never
 * contains the password) so we can find the cause of a failure.
 */
function logAuthError(step: string, error: { name?: string; status?: number; code?: string; message: string; cause?: unknown }) {
  console.error(`[auth] ${step} failed:`, {
    name: error.name,
    status: error.status,
    code: error.code,
    message: error.message,
    cause: error.cause instanceof Error ? error.cause.message : error.cause,
  });
}

/** Turns Supabase error messages into short, clear sentences. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "The email or password is wrong.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Please log in.";
  if (m.includes("email not confirmed")) return "Please confirm your email first.";
  if (m.includes("validate email") || m.includes("invalid format") || m.includes("email address"))
    return "Please enter a valid email address.";
  if (m.includes("password")) return message;
  if (m.includes("rate limit")) return "Too many tries. Please wait a minute and try again.";
  return "Something went wrong. Please try again.";
}

export async function login(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const invalid = validate(email, password);
  if (invalid) return { error: invalid, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logAuthError("login", error);
    return { error: friendly(error.message), email };
  }

  revalidatePath("/", "layout");
  redirect("/inbox");
}

export async function signup(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { email, password } = readCredentials(formData);
  const invalid = validate(email, password);
  if (invalid) return { error: invalid, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    logAuthError("signup", error);
    return { error: friendly(error.message), email };
  }

  // If "Confirm email" is ON in Supabase, there is no session yet.
  if (!data.session) {
    return { message: "Account created. Check your email to confirm it, then log in.", email };
  }

  revalidatePath("/", "layout");
  redirect("/inbox");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
