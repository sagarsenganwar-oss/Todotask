"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { NETWORK_ERROR, field, withNetworkError } from "@/lib/network";
import type { AuthFormState } from "./auth-actions";

type Props = {
  mode: "login" | "signup";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
};

export function AuthForm({ mode, action }: Props) {
  const [safeAction] = useState(() =>
    withNetworkError(action, (formData): AuthFormState => ({ error: NETWORK_ERROR, email: field(formData, "email") })),
  );
  const [state, formAction, pending] = useActionState(safeAction, undefined);
  const isLogin = mode === "login";

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="mb-1 text-2xl font-bold">Todotask</h1>
        <p className="mb-6 text-sm text-neutral-500">
          {isLogin ? "Log in to your account" : "Create a new account"}
        </p>

        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state?.email ?? ""}
              key={state?.email ?? "empty"}
              required
              className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-base font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={6}
              className="rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-base font-normal outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-neutral-700"
            />
            {!isLogin && (
              <span className="text-xs font-normal text-neutral-500">At least 6 characters.</span>
            )}
          </label>

          {state?.error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {state.error}
            </p>
          )}
          {state?.message && (
            <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
              {state.message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Please wait…" : isLogin ? "Log in" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-500">
          {isLogin ? "No account yet? " : "Already have an account? "}
          <Link href={isLogin ? "/signup" : "/login"} className="font-medium text-red-600 hover:underline">
            {isLogin ? "Sign up" : "Log in"}
          </Link>
        </p>
      </div>
    </main>
  );
}
