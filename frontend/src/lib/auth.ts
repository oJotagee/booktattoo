import { isAxiosError } from 'axios';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import type { UserStatus } from '@/app/(panel)/dashboard/_actions/update-status';
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
            address: data.user.address,
            phone: data.user.phone,
            bio: data.user.bio,
            status: data.user.status,
            times: data.user.times,
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
      user.name = data.user.name;
      user.image = data.user.image;
      user.address = data.user.address;
      user.phone = data.user.phone;
      user.bio = data.user.bio;
      user.status = data.user.status;
      user.times = data.user.times;

      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      if (account && user) {
        token.accessToken =
          (account as Record<string, unknown>).userServiceAccessToken ??
          (user as { accessToken?: string }).accessToken;
        token.refreshToken =
          (account as Record<string, unknown>).userServiceRefreshToken ??
          (user as { refreshToken?: string }).refreshToken;
        token.sub = user.id;
        token.name = user.name;
        token.picture = user.image;
        token.address = user.address;
        token.phone = user.phone;
        token.bio = user.bio;
        token.status = user.status;
        token.times = user.times;
      }

      if (trigger === 'update' && session) {
        const { image, ...rest } = session as { image?: string | null } & Record<string, unknown>;
        if (image !== undefined) token.picture = image;
        Object.assign(token, rest);
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.id = token.sub as string;
      session.user.name = token.name as string;
      session.user.image = token.picture as string | null;
      session.user.address = token.address as string | null;
      session.user.phone = token.phone as string | null;
      session.user.bio = token.bio as string | null;
      session.user.status = token.status as UserStatus;
      session.user.times = token.times as string[];

      return session;
    },
  },
});
