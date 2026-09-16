import { Roboto, Playfair_Display } from 'next/font/google';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';

import { Providers } from './providers';

import './globals.css';

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
        'font-sans',
      )}
    >
      <body className="min-h-full flex flex-col dark">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
