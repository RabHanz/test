import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = { id: '1', name: 'Test User', email: credentials?.email, role: 'ADMIN' };
        return user;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback invoked. Token before update:', token);
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      console.log('JWT callback invoked. Token after update:', token);
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback invoked. Token:', token);
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      console.log('Session callback invoked. Session:', session);
      return session;
    },
  },
};