import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/* ============================================================
   🔄 Helper: Refresh Token
   ============================================================ */
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
      accessTokenExpires: Date.now() + data.expires_in * 1000, // Django = 4 jam
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

/* ============================================================
   ⚙️ NextAuth Config
   ============================================================ */
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember Me", type: "checkbox" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const res = await fetch("http://localhost:8000/api/account/login/staff", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            username: credentials.username,
            password: credentials.password,
            grant_type: "password",
            client_id: process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID ?? "",
            client_secret: process.env.NEXT_PUBLIC_DJANGO_CLIENT_SECRET ?? "",
          }),
        });

        if (!res.ok) return null;
        const data = await res.json();

        const remember =
          credentials.remember === "true" || credentials.remember === "on";

        // Gunakan nilai dari Django (4 jam dan 7 hari)
        const refreshExpiresIn = data.refresh_expires_in
          ? data.refresh_expires_in * 1000
          : 7 * 24 * 60 * 60 * 1000; // fallback ke 7 hari

        return {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.is_staff ? "staff" : "user",
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpires: Date.now() + data.expires_in * 1000, // 4 jam
          remember,
          refreshExpiresAt: Date.now() + refreshExpiresIn, // 7 hari
        };
      },
    }),
  ],

  /* ============================================================
     🔐 JWT & Session Callbacks
     ============================================================ */
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.remember = user.remember;
        token.refreshExpiresAt = user.refreshExpiresAt;
        return token;
      }

      if (!token.accessTokenExpires) return token;

      // Jika access token masih valid (4 jam)
      if (Date.now() < (token.accessTokenExpires as number)) return token;

      // Jika access token expired tapi refresh token masih valid (7 hari)
      if (token.remember && Date.now() < (token.refreshExpiresAt as number)) {
        return await refreshAccessToken(token);
      }

      // Kalau dua-duanya expired
      return { ...token, error: "RefreshTokenExpired" };
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        session.user.remember = token.remember as boolean;
        (session as any).error = token.error ?? null;
      }

      // Max age session sesuai token
      const maxAge = token.remember ? 7 * 24 * 60 * 60 : 4 * 60 * 60; // 7 hari atau 4 jam
      session.maxAge = maxAge;

      return session;
    },
  },

  /* ============================================================
     📄 Custom Pages
     ============================================================ */
  pages: {
    signIn: "/", // halaman login
  },

  /* ============================================================
     🧩 Session & Cookie Settings
     ============================================================ */
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 jam default
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
