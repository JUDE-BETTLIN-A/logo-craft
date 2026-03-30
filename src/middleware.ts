import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_EMAIL = "judebettlin@gmail.com";

// Routes that require admin access
const ADMIN_ROUTES = ["/sell"];

// Auth routes (public)
const AUTH_ROUTES = ["/auth/signin", "/auth/signup"];

// API routes that require admin
const ADMIN_API_ROUTES = [
  "/api/telegram-bot",
  "/api/leads",
  "/api/negotiations",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session from cookie
  const session = request.cookies.get("session")?.value;

  // Check if it's an admin API route
  const isAdminApiRoute = ADMIN_API_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if it's an admin page route
  const isAdminPageRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Allow auth routes and public routes
  if (
    AUTH_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname === "/" ||
    pathname === "/generate" ||
    pathname === "/pricing" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/generate") ||
    pathname.startsWith("/api/logos")
  ) {
    return NextResponse.next();
  }

  // For admin routes, check authentication and authorization
  if (isAdminPageRoute || isAdminApiRoute) {
    if (!session) {
      // Redirect to signin if not authenticated
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    try {
      const user = JSON.parse(decodeURIComponent(session));
      
      // Check if user email matches admin email
      if (user.email !== ADMIN_EMAIL) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Access denied. Admin access required." },
            { status: 403 }
          );
        }
        // Redirect non-admin users to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // Invalid session
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Invalid session" },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/sell/:path*",
    "/api/telegram-bot/:path*",
    "/api/leads/:path*",
    "/api/negotiations/:path*",
  ],
};
