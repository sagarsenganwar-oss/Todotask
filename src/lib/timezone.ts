import "server-only";
import { cookies } from "next/headers";
import { TZ_COOKIE, isValidTimeZone, todayIn } from "./dates";

/** The user's time zone from the "tz" cookie, or UTC if it is not set yet. */
export async function getTimeZone(): Promise<string> {
  const tz = (await cookies()).get(TZ_COOKIE)?.value;
  return isValidTimeZone(tz) ? tz : "UTC";
}

/** Today's date ("YYYY-MM-DD") for the current user. */
export async function getToday(): Promise<string> {
  return todayIn(await getTimeZone());
}
