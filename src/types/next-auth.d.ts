import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      accessToken: string;
      refreshToken: string;
      remember: boolean; // ✅ tambahkan ini
    } & DefaultSession["user"];
    error?: string;
    maxAge?: number; // opsional, karena kita set di session callback
  }

  interface User extends DefaultUser {
    id: string;
    username: string;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    remember: boolean; // ✅ tambahkan ini
    refreshExpiresAt: number; // ✅ untuk batas hidup refresh token
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    email: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    remember: boolean; // ✅ tambahkan ini
    refreshExpiresAt: number; // ✅ tambahkan ini juga
    error?: string;
  }
}
