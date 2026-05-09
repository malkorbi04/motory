import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (keeps tokens alive)
  const { data: { user } } = await supabase.auth.getUser();

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    // Public pages — no login required
    if (pathname === "/login" || pathname.startsWith("/submit")) return response;
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ── Already logged in, hitting /login → send to correct home ──────────────
  if (pathname === "/login") {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    const dest = profile?.role === "dealer" ? "/dealer" : "/inventory";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── Role-based access ──────────────────────────────────────────────────────
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();

  // If profile is missing → send to login (safety net)
  if (!profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (profile.role === "dealer") {
    // Dealers: only /dealer, /cars/add, and /cars/[id]/edit
    const allowed =
      pathname === "/dealer" ||
      pathname === "/cars/add" ||
      /^\/cars\/[^/]+\/edit$/.test(pathname);

    if (!allowed) {
      return NextResponse.redirect(new URL("/dealer", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico).*)"],
};
