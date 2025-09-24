import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Kalau tidak ada token (belum login)
  if (!token) {
    // kalau user coba akses /admin atau /home tapi belum login → redirect ke login
    if (req.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }
  if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "staff") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  // Kalau SUDAH login tapi masih buka halaman login ("/")
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // Kalau user bukan staff tapi akses /admin
  // if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "staff") {
  //   return NextResponse.redirect(new URL("/home", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*", // Middleware hanya jalan untuk halaman admin
  ],
};
