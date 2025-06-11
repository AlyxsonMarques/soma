import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  if (req.nextUrl.pathname.startsWith("/api/v1")) {
    return NextResponse.next(); // Passa a requisição diretamente para a rota de API
  }
  const isAuthenticated = !!req.auth;
  const isApproved = (req.auth?.user as any)?.status == "APPROVED";
  const isBudgetist = (req.auth?.user as any)?.type == "BUDGETIST";

  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!isApproved) {
      return NextResponse.redirect(new URL("/registration-pending", req.url));
    }
    if (!isBudgetist) {
      return NextResponse.redirect(new URL("/repair-order", req.url));
    }
  }

  if (req.nextUrl.pathname.startsWith("/repair-order")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!isApproved) {
      return NextResponse.redirect(new URL("/registration-pending", req.url));
    }
  }

  if (req.nextUrl.pathname.includes("/register") || req.nextUrl.pathname.includes("/login")) {
    if (isAuthenticated && isApproved) {
      return NextResponse.redirect(new URL("/dashboard/repair-orders", req.url));
    }
  }

  if (req.nextUrl.pathname.includes("/registration-pending")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (isApproved) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
});

// Define protected routes using Next.js matcher config
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*", // Matches /dashboard and all sub-routes
    "/repair-order/:path*", // Matches /repair-order and all sub-routes
    // Auth routes
    "/login",
    "/register",
    "/registration-pending",
  ],
};
