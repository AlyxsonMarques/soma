import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.auth && ["/login", "/register"].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard/repair-orders", req.url));
  }
});

// Define protected routes using Next.js matcher config
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*", // Matches /dashboard and all sub-routes
    // Auth routes
    "/login",
    "/register",
  ],
};
