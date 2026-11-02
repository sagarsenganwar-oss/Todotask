"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { Project } from "@/lib/types";
import { createProject, type ProjectFormState } from "@/app/projects/actions";
import { logout } from "@/app/auth-actions";
import { NETWORK_ERROR, field, withNetworkError } from "@/lib/network";

const safeCreateProject = withNetworkError(createProject, (formData): ProjectFormState => ({
  error: NETWORK_ERROR,
  name: field(formData, "name"),
}));

type Props = {
  email: string;
  projects: Project[];
  counts: { byProject: Record<string, number>; today: number };
  children: ReactNode;
};

/**
 * The frame around every private page: a sidebar with the views and the
 * projects. On a laptop the sidebar is always visible; on a phone it opens
 * from the ☰ button.
 */
export function AppShell({ email, projects, counts, children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close the phone menu after moving to another page.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  // Escape closes the phone menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const inbox = projects.find((p) => p.is_inbox);
  const others = projects.filter((p) => !p.is_inbox);

  return (
    <div className="flex min-h-dvh flex-1 flex-col md:flex-row">
      {/* Phone top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden dark:border-neutral-800 dark:bg-neutral-950/95">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="rounded-md p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
            <path fill="currentColor" d="M3 5h14v2H3zM3 9h14v2H3zM3 13h14v2H3z" />
          </svg>
        </button>
        <span className="font-semibold">Todotask</span>
      </header>

      {/* Dark overlay behind the phone menu */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto border-r border-neutral-200 bg-neutral-50 p-4 transition-[translate,visibility] md:visible md:static md:z-auto md:w-64 md:max-w-none md:translate-x-0 dark:border-neutral-800 dark:bg-neutral-900 ${
          // "invisible" also removes the hidden phone menu from keyboard Tab order.
          menuOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
        aria-label="Main menu"
      >
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Todotask</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-1 text-xl leading-none hover:bg-neutral-200 md:hidden dark:hover:bg-neutral-800"
          >
            ×
          </button>
        </div>

        <nav aria-label="Views" className="flex flex-col gap-0.5">
          <NavLink href="/inbox" label="Inbox" icon="📥" count={inbox ? counts.byProject[inbox.id] : 0} active={pathname === "/inbox"} />
          <NavLink href="/today" label="Today" icon="📅" count={counts.today} active={pathname === "/today"} />
          <NavLink href="/upcoming" label="Upcoming" icon="🗓️" active={pathname === "/upcoming"} />
          <NavLink href="/completed" label="Completed" icon="✅" active={pathname === "/completed"} />
        </nav>

        <section aria-label="Projects" className="flex flex-col gap-0.5">
          <h2 className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">My projects</h2>
          {others.length === 0 && <p className="px-2 text-xs text-neutral-500">No projects yet.</p>}
          {others.map((p) => (
            <NavLink
              key={p.id}
              href={`/projects/${p.id}`}
              label={p.name}
              icon="#"
              count={counts.byProject[p.id]}
              active={pathname === `/projects/${p.id}`}
            />
          ))}
          <AddProjectForm />
        </section>

        <div className="mt-auto border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <p className="truncate px-2 text-xs text-neutral-500" title={email}>
            {email}
          </p>
          <form action={logout}>
            <LogoutButton />
          </form>
        </div>
      </aside>

      <main className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-4 p-4 sm:p-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon,
  count,
  active,
}: {
  href: string;
  label: string;
  icon: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
        active
          ? "bg-red-100 font-medium text-red-800 dark:bg-red-950 dark:text-red-200"
          : "hover:bg-neutral-200 dark:hover:bg-neutral-800"
      }`}
    >
      <span className="w-5 text-center text-neutral-500" aria-hidden="true">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count ? <span className="text-xs text-neutral-500">{count}</span> : null}
    </Link>
  );
}

function AddProjectForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(safeCreateProject, undefined);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-neutral-600 hover:bg-neutral-200 hover:text-red-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
      >
        <span className="w-5 text-center text-red-600" aria-hidden="true">
          +
        </span>
        Add project
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-1 flex flex-col gap-2 rounded-md bg-white p-2 shadow-sm dark:bg-neutral-950" noValidate>
      <label htmlFor="new-project-name" className="sr-only">
        Project name
      </label>
      <input
        key={state?.error ?? "new"}
        id="new-project-name"
        name="name"
        defaultValue={state?.name ?? ""}
        placeholder="Project name"
        maxLength={100}
        autoFocus
        className="rounded-md border border-neutral-300 bg-transparent px-2 py-1.5 text-base outline-none sm:text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700"
      />
      {state?.error && (
        <p role="alert" className="text-xs text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded px-2 py-1 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
    </form>
  );
}

/** Shows "Logging out…" while the logout is in progress. */
function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-neutral-200 disabled:opacity-60 dark:hover:bg-neutral-800"
    >
      {pending ? "Logging out…" : "Log out"}
    </button>
  );
}
