"use client";

/**
 * Catches errors that the (app) error page cannot, for example when the
 * sidebar data (projects) fails to load in src/app/(app)/layout.tsx.
 */
export default function RootError({ retry }: { error: Error; retry: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div role="alert" className="flex max-w-sm flex-col items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
        <p className="font-medium">Something went wrong while loading Todotask.</p>
        <p>Please check your internet connection and try again. If you were saving a change, it may not have been saved.</p>
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
