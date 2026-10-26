import { NextResponse, type NextRequest } from 'next/server';

import { api } from '@/lib/api';

export async function GET(request: NextRequest) {
  const fallback = new URL('/dashboard?calendar=error', request.url);

  try {
    const response = await api.get('/google-calendar/callback', {
      params: Object.fromEntries(request.nextUrl.searchParams),
      maxRedirects: 0,
      validateStatus: (status) => status >= 300 && status < 400,
    });

    const location = response.headers.location;

    return NextResponse.redirect(typeof location === 'string' ? location : fallback);
  } catch {
    return NextResponse.redirect(fallback);
  }
}
