import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from 'bcryptjs'
import User from '@/models/user'

const authOptions: NextAuthOptions = ({
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
          if (!credentials?.username || !credentials?.password) {
            throw new Error('Missing credentials')
          }

          // Find user
          const user = await User.findOne({
            where: { username: credentials.username }
          })

          if (!user) {
            throw new Error('User not found')
          }

          const dbPassword = user.get('password') as string

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, dbPassword)

          if (!isValid) {
            throw new Error('Invalid password')
          }

          // Return user data (excluding password)
          const userObject = user.get({ plain: true })
          delete userObject.password

          return {
            id: userObject.id.toString(),
            username: userObject.username,
            name: userObject.name
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, trigger, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.name = user.name
      }

      if (trigger === 'update') {
        const updatedUser = await User.findOne({
          where: { id: token.id },
        })

        if (updatedUser) {
          token.username = updatedUser.username
          token.name = updatedUser.name
        }
      }

      const currentUser = await User.findOne({
        where: { id: token.id },
      })

      if (!currentUser) {
        throw new Error("Unauthorized")
      }

      return token
    },
    async session({ session, token }) {
      if (!token) {
        session.user.id = ""
        session.user.username = ""
        session.user.name = ""
        return session
      }

      session.user.id = token.id
      session.user.username = token.username as string
      session.user.name = token.name as string

      const latestUser = await User.findOne({
        where: { id: token.id },
      })

      if (latestUser) {
        session.user.name = latestUser.name
      }

      return session
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
})

export default authOptions
