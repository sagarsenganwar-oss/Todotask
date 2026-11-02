import Link from "next/link";

/** Shown for any address that doesn't exist in the app. */
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <span className="text-4xl" aria-hidden="true">
          🔍
        </span>
        <h1 className="text-xl font-bold">Page not found</h1>
        <p className="text-sm text-neutral-500">This page doesn&apos;t exist. Check the address and try again.</p>
        <Link href="/inbox" className="mt-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
          Go to your Inbox
        </Link>
      </div>
    </main>
  );
}
