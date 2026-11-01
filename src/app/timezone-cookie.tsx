"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TZ_COOKIE } from "@/lib/dates";

/**
 * Saves the browser's time zone (for example "Asia/Kolkata") in a cookie,
 * so the server knows which day is "today" for this user.
 */
export function TimezoneCookie() {
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = document.cookie.match(new RegExp(`(?:^|; )${TZ_COOKIE}=([^;]*)`));
    const current = match ? decodeURIComponent(match[1]) : "";
    if (tz && current !== tz) {
      document.cookie = `${TZ_COOKIE}=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }
  }, [router]);

  return null;
}
