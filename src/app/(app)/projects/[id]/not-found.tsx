import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

/** Shown for a project that doesn't exist, was deleted, or belongs to someone else. */
export default function ProjectNotFound() {
  return (
    <EmptyState icon="🔍" title="Project not found">
      It may have been deleted, or the link is wrong.{" "}
      <Link href="/inbox" className="font-medium text-red-600 hover:underline">
        Go to your Inbox
      </Link>
    </EmptyState>
  );
}
