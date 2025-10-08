import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// 🔄 helper untuk refresh token
async function refreshAccessToken(token: any) {
  try {
    const res = await fetch("http://localhost:8000/o/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
        client_id: process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID ?? "",
        client_secret: process.env.NEXT_PUBLIC_DJANGO_CLIENT_SECRET ?? "",
      }),
    });

    if (!res.ok) throw new Error("Failed to refresh token");

    const data = await res.json();

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000, // simpan expired baru
      refreshToken: data.refresh_token ?? token.refreshToken, // DOT kadang kasih refresh baru
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const res = await fetch(
          "http://localhost:8000/api/account/login/staff",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              username: credentials.username,
              password: credentials.password,
              grant_type: "password", // ✅ typo diperbaiki (grand_type ❌ → grant_type ✅)
              client_id: process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID ?? "",
              client_secret: process.env.NEXT_PUBLIC_DJANGO_CLIENT_SECRET ?? "",
            }),
          }
        );

        if (!res.ok) return null;
        const data = await res.json();

        return {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.is_staff ? "staff" : "user",
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpires: Date.now() + data.expires_in * 1000, // tambahin expired
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // login awal
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        return token;
      }

      // kalau token masih valid → return langsung
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // kalau expired → refresh
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        (session as any).error = token.error;
      }
      return session;
    },
  },

  pages: {
    signIn: "/", // pakai halaman login custom
  },
  session: {
    strategy: "jwt",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
