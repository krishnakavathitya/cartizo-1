import { getCurrentUser } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDatabase } from '@/lib/db';

export interface GraphQLContext {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  } | null;
}

export async function createContext(): Promise<GraphQLContext> {
  try {
    // First, try to get user from JWT token
    const jwtUser = await getCurrentUser();

    if (jwtUser) {
      return {
        user: {
          id: jwtUser.userId,
          email: jwtUser.email,
          name: jwtUser.name,
          role: jwtUser.role,
        },
      };
    }

    // If no JWT, check for NextAuth session
    const session = await getServerSession(authOptions);

    if (session?.user?.email) {
      // Get full user data from database
      const db = getDatabase();
      const dbUser = await db.users.getByEmail(session.user.email);

      if (dbUser) {
        return {
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
          },
        };
      }
    }

    // No authentication found
    return {
      user: null,
    };
  } catch (error) {
    console.error('Error creating GraphQL context:', error);
    return {
      user: null,
    };
  }
}

export function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
}

export function requireAdmin(context: GraphQLContext) {
  const user = requireAuth(context);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}
