import type { ReactNode } from "react";

/** A friendly message shown when a list or view has nothing in it. */
export function EmptyState({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
      <span className="mb-1 text-4xl" aria-hidden="true">
        {icon}
      </span>
      <p className="font-medium">{title}</p>
      {children && <p className="max-w-xs text-sm text-neutral-500">{children}</p>}
    </div>
  );
}
