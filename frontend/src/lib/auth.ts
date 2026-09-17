import { isAxiosError } from 'axios';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';

import { type UserServiceSession, userServiceApi } from './user-service-api';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          const { data } = await userServiceApi.post<UserServiceSession>('/users/login', {
            email: credentials.email,
            password: credentials.password,
          });

          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            image: data.user.image,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          if (isAxiosError(error) && error.response?.status === 401) return null;
          throw error;
        }
      },
    }),
    GitHub,
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'github') return true;

      const { data } = await userServiceApi.post<UserServiceSession>('/users/oauth/upsert', {
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        email: user.email,
        name: user.name,
        image: (profile as { avatar_url?: string })?.avatar_url ?? user.image ?? null,
      });

      (account as Record<string, unknown>).userServiceAccessToken = data.accessToken;
      (account as Record<string, unknown>).userServiceRefreshToken = data.refreshToken;
      user.id = data.user.id;

      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken =
          (account as Record<string, unknown>).userServiceAccessToken ??
          (user as { accessToken?: string }).accessToken;
        token.refreshToken =
          (account as Record<string, unknown>).userServiceRefreshToken ??
          (user as { refreshToken?: string }).refreshToken;
        token.sub = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub as string;

      return session;
    },
  },
});
