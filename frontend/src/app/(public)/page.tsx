import type { Metadata } from 'next';

import { HowWorks } from './_components/how-works';
import { JsonLd } from '@/components/json-ld';
import { Footer } from './_components/footer';
import { Header } from './_components/header';
import { Galery } from './_components/galery';
import { Faq, faq } from './_components/faq';
import { Hero } from './_components/hero';
import { Team } from './_components/team';
import {
  BASE_OPEN_GRAPH,
  CONTACT_EMAIL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...BASE_OPEN_GRAPH, url: '/', title: SITE_TITLE, description: SITE_DESCRIPTION },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: `${SITE_URL}/android-chrome-512x512.png`,
      email: CONTACT_EMAIL,
      areaServed: { '@type': 'Country', name: 'Brasil' },
      knowsAbout: ['Flash tattoo', 'Agendamento de tatuagem'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faq.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <JsonLd data={structuredData} />

      <Header />

      <main>
        <Hero />

        <HowWorks />

        <Galery />

        <Team />

        <Faq />
      </main>

      <Footer />
    </div>
  );
}
