import NextAuth from "next-auth";
import { authOptions } from "./lib/nextAuthOptions";

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
