import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs'
import User from '@/models/user'
import { initDatabase } from '@/lib/db'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, _req) {
        initDatabase()
        try {
          if (!credentials?.username || !credentials?.password) {
            return null
          }

          const user = await User.findOne({
            where: {
              username: credentials.username
            }
          });

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id.toString(),
            username: user.username,
            name: user.name
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
        // const user = credentials?.username
        // const password = credentials?.password
        // if (user == "johndoe" && password == "password"){
        //   return {
        //     "id": "10",
        //     "username": user,
        //     "name": "Hafizh Ibnu Syam"
        //   }
        // }
        // return null
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  },
})

export { handler as GET, handler as POST }