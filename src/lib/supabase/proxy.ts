import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Pages that anyone can open without logging in. */
const PUBLIC_PATHS = ["/login", "/signup"];

/**
 * Runs before every page request:
 * 1. Refreshes the Supabase login cookies if they are about to expire.
 * 2. Sends logged-out visitors to /login, and logged-in users away from
 *    /login and /signup.
 * This is only a fast first check. Every page and every Server Action
 * checks the session again on the server before it touches data.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not put other code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  if (!isLoggedIn && !isPublic) {
    return redirectKeepingCookies(request, supabaseResponse, "/login");
  }
  if (isLoggedIn && isPublic) {
    return redirectKeepingCookies(request, supabaseResponse, "/inbox");
  }

  return supabaseResponse;
}

/** A redirect that keeps any refreshed login cookies and cache headers. */
function redirectKeepingCookies(
  request: NextRequest,
  from: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const res = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = from.headers.get(header);
    if (value) res.headers.set(header, value);
  }
  return res;
}
