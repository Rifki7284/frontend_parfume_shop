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
      accessTokenExpires: Date.now() + data.expires_in * 1000,
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

        const res = await fetch(
          "http://localhost:8000/api/account/login/staff",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              username: credentials.username,
              password: credentials.password,
              grant_type: "password",
              client_id: process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID ?? "",
              client_secret: process.env.NEXT_PUBLIC_DJANGO_CLIENT_SECRET ?? "",
            }),
          }
        );

        if (!res.ok) return null;
        const data = await res.json();

        const remember =
          credentials.remember === "true" || credentials.remember === "on";

        const refreshExpiresIn = data.refresh_expires_in
          ? data.refresh_expires_in * 1000
          : 30 * 24 * 60 * 60 * 1000; // default 30 hari

        return {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.is_staff ? "staff" : "user",
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          accessTokenExpires: Date.now() + data.expires_in * 1000,
          remember,
          refreshExpiresAt: Date.now() + refreshExpiresIn,
        };
      },
    }),
  ],

  /* ============================================================
     🔐 JWT & Session Callbacks
     ============================================================ */
  callbacks: {
    async jwt({ token, user }) {
      // Login pertama
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

      // Kalau access token masih valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Kalau expired dan remember aktif
      if (token.remember) {
        if (Date.now() < (token.refreshExpiresAt as number)) {
          return await refreshAccessToken(token);
        } else {
          return { ...token, error: "RefreshTokenExpired" };
        }
      }

      // Kalau tidak remember
      return { ...token, error: "AccessTokenExpired" };
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
        (session as any).error = token.error;
      }

      // Hitung durasi sesi
      const defaultRememberAge = 30 * 24 * 60 * 60; // 30 hari (detik)
      const rememberMaxAge =
        token.refreshExpiresAt && token.refreshExpiresAt > Date.now()
          ? Math.floor((token.refreshExpiresAt - Date.now()) / 1000)
          : defaultRememberAge;

      const maxAge = token.remember ? rememberMaxAge : 60 * 60; // 1 jam kalau tidak remember
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
    maxAge: 60 * 60, // fallback default (1 jam)
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token", // ⬅️ perbaikan utama agar tidak error invalid prefix
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
