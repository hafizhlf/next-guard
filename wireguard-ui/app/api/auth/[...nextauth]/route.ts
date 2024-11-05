// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';
import { connectDatabase } from '@/lib/db';
import models from '@/models';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Ensure database connection
          await connectDatabase();

          if (!credentials?.username || !credentials?.password) {
            throw new Error('Missing credentials');
          }

          // Find user
          const user = await models.User.findOne({
            where: { username: credentials.username }
          });

          if (!user) {
            throw new Error('User not found');
          }

          const dbPassword = user.get('password') as string;

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, dbPassword);

          if (!isValid) {
            throw new Error('Invalid password');
          }

          // Return user data (excluding password)
          const userObject = user.get({ plain: true });
          delete userObject.password;

          return {
            id: userObject.id.toString(),
            username: userObject.username,
            name: userObject.name
          }
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, trigger, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.name = user.name;
      }

      if (trigger === 'update') {
        const updatedUser = await models.User.findOne({
          where: { id: token.id },
        });
  
        if (updatedUser) {
          token.username = updatedUser.username;
          token.name = updatedUser.name;
        }
      }

      console.log(token, 'token')
      return token;
    },
    async session({ session, token }) {
      console.log(session, 'session-')
      console.log(token, 'token-')

      session.user.id = token.id;
      session.user.username = token.username as string;
      session.user.name = token.name as string;

      const latestUser = await models.User.findOne({
        where: { id: token.id },
      });

      if (latestUser) {
        session.user.username = latestUser.username;
        session.user.name = latestUser.name;
      }

      console.log(session, "session")
      return session;
    }
  },
  pages: {
    signIn: '/login',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});

export { handler as GET, handler as POST };