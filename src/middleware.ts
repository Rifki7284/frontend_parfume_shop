import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Kalau tidak ada token (belum login), redirect ke login
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Cek kalau user bukan staff
  if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "staff") {
    return NextResponse.redirect(new URL("/", req.url)); // halaman forbidden custom
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // Middleware hanya jalan untuk halaman admin
  ],
};
