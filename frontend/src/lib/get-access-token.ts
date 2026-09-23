import { getToken } from 'next-auth/jwt';
import { headers } from 'next/headers';

export async function getAccessToken(): Promise<string | null> {
  const token = await getToken({
    req: { headers: await headers() },
    secret: process.env.AUTH_SECRET,
  });

  return (token?.accessToken as string | undefined) ?? null;
}
