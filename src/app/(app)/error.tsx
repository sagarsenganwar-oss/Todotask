"use client";

/** Shown when a private page fails to load (for example a network problem). */
export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
      <p className="font-medium">Something went wrong while loading this page.</p>
      <p>Please check your internet connection and try again.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}
