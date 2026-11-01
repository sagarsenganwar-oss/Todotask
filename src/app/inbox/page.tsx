import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { logout } from "../auth-actions";

export const metadata: Metadata = { title: "Inbox · Todotask" };

export default async function InboxPage() {
  // Server-side session check before any private data is read.
  const { supabase, email } = await requireUser();

  // Row Level Security makes sure this only returns the user's own projects.
  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, is_inbox")
    .order("created_at");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-4 sm:p-8">
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

      <section className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
        <h2 className="mb-2 font-semibold">Your projects</h2>
        {error ? (
          <p role="alert" className="text-sm text-red-600">Could not load your projects. Please refresh the page.</p>
        ) : projects && projects.length > 0 ? (
          <ul className="list-disc pl-5 text-sm">
            {projects.map((p) => (
              <li key={p.id}>
                {p.name}
                {p.is_inbox && <span className="text-neutral-500"> (default)</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-500">No projects found.</p>
        )}
        <p className="mt-4 text-xs text-neutral-500">Tasks come in the next milestone.</p>
      </section>
    </main>
  );
}
