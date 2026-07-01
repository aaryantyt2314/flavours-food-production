import { db } from '@/lib/db';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import type { User as NextAuthUser } from 'next-auth';

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

export class AuthError extends Error {
  status: 401 | 403;

  constructor(message: string, status: 401 | 403) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  secret: nextAuthSecret,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;

        if (!email || !password) {
          return null;
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return null;

        const authenticatedUser: NextAuthUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'customer' | 'admin',
          phone: user.phone,
        };

        return authenticatedUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.phone = user.phone;
      }

      if (trigger === 'update' && session?.user) {
        if (session.user.name !== undefined) token.name = session.user.name;
        if (session.user.phone !== undefined) token.phone = session.user.phone;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string | null) || session.user.name || null;
        session.user.email = (token.email as string) || session.user.email || '';
        session.user.role = (token.role as 'customer' | 'admin') || 'customer';
        session.user.phone = (token.phone as string | null) || null;
      }
      return session;
    },
  },
};

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new AuthError('Unauthorized', 401);
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'admin') {
    throw new AuthError('Forbidden', 403);
  }
  return session;
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return null;
}
