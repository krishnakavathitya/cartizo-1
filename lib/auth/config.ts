import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { getDatabase } from '@/lib/db'

// Mock users for demo (in production, use a real database)
const mockUsers = [
  {
    id: '2',
    email: 'admin@cartizo.com',
    password: '$2a$10$YourHashedPasswordHere', // bcrypt hash of 'admin123'
    name: 'Admin User',
    role: 'ADMIN',
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required')
        }

        // Find user in mock data
        const user = mockUsers.find(u => u.email === credentials.email)

        if (!user) {
          throw new Error('Invalid email or password')
        }

        // For demo purposes, accept any password
        // In production, use: await bcrypt.compare(credentials.password, user.password)
        const isPasswordValid = true // Simplified for demo

        if (!isPasswordValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign-in
      if (account?.provider === 'google') {
        try {
          const db = getDatabase()

          // Check if user exists
          let existingUser = await db.users.getByEmail(user.email!)

          if (!existingUser) {
            // Create new user from Google profile
            existingUser = await db.users.create({
              name: user.name || 'Google User',
              email: user.email!,
              password: '', // No password for OAuth users
              role: 'user',
              avatar: user.image || undefined,
            })
            console.log('✅ Created new user from Google:', existingUser.email)
          } else if (user.image && !existingUser.avatar) {
            // Update photo if user exists but doesn't have one
            await db.users.update(existingUser.id, { avatar: user.image })
            console.log('✅ Updated user photo:', existingUser.email)
          }

          // Store user ID in the account for later use
          user.id = existingUser.id.toString()

          return true
        } catch (error) {
          console.error('Error during Google sign-in:', error)
          return false
        }
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // After Google sign-in, redirect to our callback to set JWT cookie
      if (url.includes('/api/auth/callback/google')) {
        return `${baseUrl}/api/auth/google-callback`
      }
      // Default redirect
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.role = user.role

        // For Google sign-in, get user from database
        if (account?.provider === 'google') {
          const db = getDatabase()
          const dbUser = await db.users.getByEmail(user.email!)
          if (dbUser) {
            token.id = dbUser.id.toString()
            token.role = dbUser.role
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
