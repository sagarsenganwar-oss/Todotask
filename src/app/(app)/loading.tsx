/**
 * Shown instantly while a private page loads its tasks from the database.
 * The sidebar stays visible; only the page area shows this placeholder.
 */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex animate-pulse flex-col gap-4">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-col gap-2">
        <div className="h-7 w-40 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="h-4 w-56 rounded bg-neutral-100 dark:bg-neutral-900" />
      </div>
      <ul className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-900">
        {[72, 56, 64, 48].map((w) => (
          <li key={w} className="flex items-start gap-3 py-3">
            <div className="h-5 w-5 shrink-0 rounded-full border-2 border-neutral-200 dark:border-neutral-800" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-4 rounded bg-neutral-200 dark:bg-neutral-800" style={{ width: `${w}%` }} />
              <div className="h-3 w-20 rounded bg-neutral-100 dark:bg-neutral-900" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
