import type { Metadata } from 'next';

import HeroImg from '../../public/hero.webp';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://booktattoo.vercel.app'
).replace(/\/$/, '');

export const SITE_NAME = 'BookTattoo';

export const SITE_DESCRIPTION =
  'Escolha um flash tattoo exclusivo, reserve data e horário online e pague o sinal com segurança. O restante é pago no estúdio, no dia da sessão.';

export const SITE_TITLE = `${SITE_NAME} — Flash tattoo com agendamento online`;

export const BASE_OPEN_GRAPH = {
  type: 'website',
  locale: 'pt_BR',
  siteName: SITE_NAME,
  images: [{ url: HeroImg.src, width: HeroImg.width, height: HeroImg.height }],
} satisfies NonNullable<Metadata['openGraph']>;
