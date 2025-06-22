import type { AuthConfig } from "@auth/core";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { db } from "./db";
import Google from "next-auth/providers/google";
import { User } from "@/types/db.t";
import { fetchRedis } from "@/helpers/redis";

export const authOptions: AuthConfig = {
  adapter: UpstashRedisAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      const dbUserResult = (await fetchRedis('get', `user:${token.id}`)) as
        | string
        | null

      if (!dbUserResult) {
        if (user) {
          token.id = user!.id
        }

        return token
      }

      const dbUser = JSON.parse(dbUserResult) as User

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.email = token.email as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    redirect() {
      return "/dashboard";
    },
  },
  secret: process.env.AUTH_SECRET,
};
