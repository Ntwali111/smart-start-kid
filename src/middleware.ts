import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret-change-me";
const encoder = new TextEncoder();

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("ssk_token")?.value;
  const { pathname } = request.nextUrl;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));
    const role = String(payload.role ?? "");

    if (pathname.startsWith("/parent-dashboard") && !["parent", "facilitator", "admin"].includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/dashboard") && role === "parent") {
      return NextResponse.redirect(new URL("/parent-dashboard", request.url));
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/lessons/:path*", "/quiz/:path*", "/goals/:path*", "/progress/:path*", "/parent-dashboard/:path*"],
};

