import { Playfair_Display, Roboto } from 'next/font/google';
import type { Metadata } from 'next';

import './globals.css';

import { BASE_OPEN_GRAPH, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';
import { SessionAuthProvider } from '@/components/session-auth';
import { Providers } from './providers';
import { cn } from '@/lib/utils';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      className={cn('h-full', 'antialiased', roboto.variable, playfairDisplay.variable)}
    >
      <body className="min-h-full flex flex-col dark">
        <Providers>
          <SessionAuthProvider>{children}</SessionAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
