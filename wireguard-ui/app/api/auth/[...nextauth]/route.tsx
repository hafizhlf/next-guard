import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

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
        const user = credentials?.username
        const password = credentials?.password
        if (user == "johndoe" && password == "password"){
          return {
            "id": "10",
            "username": user,
            "name": "Hafizh Ibnu Syam"
          }
        }
        return null
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