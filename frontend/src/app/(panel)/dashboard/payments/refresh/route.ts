import { NextResponse, type NextRequest } from 'next/server';

import { startOnboarding } from '../_actions/start-onboarding';

export async function GET(request: NextRequest) {
  const { url } = await startOnboarding();

  return NextResponse.redirect(url ?? new URL('/dashboard/payments?connect=error', request.url));
}
