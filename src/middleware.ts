import { NextResponse, type NextRequest } from "next/server";
import { verifyTokenEdge, SESSION_COOKIE } from "./lib/auth";

export const config = {
  matcher: ["/admin/:path*", "/bookings/:path*", "/account/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyTokenEdge(token) : null;

  // Admin section
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    if (!session || session.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // User-only section
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
