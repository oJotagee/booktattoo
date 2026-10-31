import type { Metadata } from 'next';

import HeroImg from '../../public/hero.webp';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://booktattoo.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'BookTattoo';

export const CONTACT_EMAIL = 'booktattoo4@gmail.com';

export const SITE_DESCRIPTION =
  'Agende sua tatuagem online: escolha um flash exclusivo de tatuadores independentes, reserve data e horário e pague só o sinal. O restante é pago no estúdio, no dia da sessão.';

export const SITE_TITLE = `${SITE_NAME} — Agendamento de tatuagem e flash tattoo online`;

export const BASE_OPEN_GRAPH = {
  type: 'website',
  locale: 'pt_BR',
  siteName: SITE_NAME,
  images: [{ url: HeroImg.src, width: HeroImg.width, height: HeroImg.height }],
} satisfies NonNullable<Metadata['openGraph']>;
