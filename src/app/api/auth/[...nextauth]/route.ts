import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              username: credentials.username,
              password: credentials.password,
              grand_type: "password",
              client_id: process.env.NEXT_PUBLIC_DJANGO_CLIENT_ID ?? "",
              client_secret: process.env.NEXT_PUBLIC_DJANGO_CLIENT_SECRET ?? "",
            }),
            credentials: "include", // kalau mau simpan cookie session
          }
        );
        if (!res.ok) return null;
        const data = await res.json();

        return {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.is_staff ? "staff" : "user",
          accessToken: data.access_token, // simpan token dari Django
          refreshToken: data.refresh_token, // simpan refresh token
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.email = user.email;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
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
