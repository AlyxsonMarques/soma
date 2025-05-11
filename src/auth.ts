import { compare } from "bcrypt-ts";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./lib/prisma";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const { email, password } = credentials;

        const user = await prisma.user.findUnique({
          where: { email: email as string },
        });

        if (!user) {
          return null;
        }

        const passwordsMatch = await compare(password as string, user.password);
        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
          status: user.status,
          assistant: user.assistant,
          observations: user.observations,
          birthDate: user.birthDate,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // This runs when a user signs in
      if (user) {
        // Copy all user properties to the token
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.type = user.type;
        token.status = user.status;
        token.assistant = user.assistant;
        token.observations = user.observations;
        token.birthDate = user.birthDate;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      } else {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string | undefined },
          });

          token.id = dbUser?.id;
          token.name = dbUser?.name;
          token.email = dbUser?.email;
          token.type = dbUser?.type;
          token.status = dbUser?.status;
          token.assistant = dbUser?.assistant;
          token.observations = dbUser?.observations;
          token.birthDate = dbUser?.birthDate;
          token.createdAt = dbUser?.createdAt;
          token.updatedAt = dbUser?.updatedAt;
        } catch (error) {
          console.error(`Error on auth.ts: ${error}`);
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      // Pass the token data to the session
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          type: token.type,
          status: token.status,
          assistant: token.assistant,
          observations: token.observations,
          birthDate: token.birthDate,
          createdAt: token.createdAt,
          updatedAt: token.updatedAt,
        },
      };
    },
  },
});
