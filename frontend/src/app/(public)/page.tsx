import type { Metadata } from 'next';

import { BASE_OPEN_GRAPH, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';
import { HowWorks, steps } from './_components/how-works';
import { JsonLd } from '@/components/json-ld';
import { Footer } from './_components/footer';
import { Header } from './_components/header';
import { Galery } from './_components/galery';
import { Hero } from './_components/hero';
import { Team } from './_components/team';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...BASE_OPEN_GRAPH, url: '/', title: SITE_TITLE, description: SITE_DESCRIPTION },
};

const faq = [
  {
    question: 'Como agendar um flash tattoo no BookTattoo?',
    answer: steps.map((step) => `${step.title}: ${step.description}`).join(' '),
  },
  {
    question: 'Como funciona o pagamento do sinal?',
    answer:
      'O sinal é pago online com cartão de crédito no checkout seguro do Stripe. O valor restante do flash é pago no estúdio, no dia da sessão.',
  },
  {
    question: 'Por quanto tempo meu horário fica reservado?',
    answer:
      'Ao seguir para o pagamento, o horário fica reservado por 30 minutos. Se o sinal não for pago nesse prazo, o horário volta a ficar disponível.',
  },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'TattooParlor',
      '@id': `${SITE_URL}/#studio`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: `${SITE_URL}/android-chrome-512x512.png`,
      image: `${SITE_URL}/android-chrome-512x512.png`,
      currenciesAccepted: 'BRL',
      paymentAccepted: 'Cartão de crédito',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'pt-BR',
      publisher: { '@id': `${SITE_URL}/#studio` },
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
      </main>

      <Footer />
    </div>
  );
}
