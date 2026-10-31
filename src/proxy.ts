import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * r8.3: keeps the owner sign-in cookies fresh. Runs only on /owner pages and
 * does nothing without the Supabase env vars. It never decides access: the
 * owner page, its actions and the CSV route each check the session again.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;
  const sb = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(list) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  try {
    await sb.auth.getUser();
  } catch {
    // Unreachable project: the page shows its calm "resting" state.
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/demos/cgr-rentals/owner", "/demos/cgr-rentals/owner/:path*"],
};
