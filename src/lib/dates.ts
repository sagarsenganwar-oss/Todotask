/**
 * Date helpers. Due dates are plain calendar dates ("YYYY-MM-DD"), so we
 * compare them as text. "Today" depends on the user's time zone, which the
 * browser stores in the "tz" cookie (see src/app/timezone-cookie.tsx).
 */

export const TZ_COOKIE = "tz";

export function isValidTimeZone(tz: string | undefined): tz is string {
  if (!tz) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Today's date as "YYYY-MM-DD" in the given time zone. */
export function todayIn(timeZone: string): string {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Adds whole days to a "YYYY-MM-DD" date. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** A short label such as "Today", "Tomorrow", "Mon, 3 Nov" or "3 Nov 2027". */
export function dueLabel(due: string, today: string): string {
  if (due === today) return "Today";
  if (due === addDays(today, 1)) return "Tomorrow";
  if (due === addDays(today, -1)) return "Yesterday";
  const d = new Date(`${due}T00:00:00Z`);
  const sameYear = due.slice(0, 4) === today.slice(0, 4);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: sameYear ? "short" : undefined,
    day: "numeric",
    month: "short",
    year: sameYear ? undefined : "numeric",
  }).format(d);
}
