import { Playfair_Display, Roboto } from 'next/font/google';
import type { Metadata } from 'next';

import './globals.css';

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
  title: 'BookTatto',
  description: 'BookTatto - Your favorite tattoo booking platform',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        'h-full',
        'antialiased',
        roboto.variable,
        playfairDisplay.variable,
      )}
    >
      <body className="min-h-full flex flex-col dark">
        <Providers>
          <SessionAuthProvider>{children}</SessionAuthProvider>
        </Providers>
      </body>
    </html>
  );
}
