import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'customer' | 'admin';
      phone: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'customer' | 'admin';
    phone: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'customer' | 'admin';
    phone?: string | null;
  }
}
