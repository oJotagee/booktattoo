import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';

export default auth((req) => {
  if (!req.auth) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
