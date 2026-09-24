import { getToken } from 'next-auth/jwt';
import { headers } from 'next/headers';

export async function getAccessToken(): Promise<string | null> {
  const requestHeaders = await headers();

  // Em HTTPS o Auth.js grava o cookie como `__Secure-authjs.session-token`;
  // sem isso o getToken procura o nome sem prefixo e não acha a sessão.
  const secureCookie = requestHeaders.get('x-forwarded-proto') === 'https';

  const token = await getToken({
    req: { headers: requestHeaders },
    secret: process.env.AUTH_SECRET,
    secureCookie,
  });

  return (token?.accessToken as string | undefined) ?? null;
}
