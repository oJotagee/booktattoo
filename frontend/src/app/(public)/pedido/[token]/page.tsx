import type { Metadata } from 'next';
import { Suspense } from 'react';

import { getClientConversation } from '../../_data-access/get-client-conversation';
import { ConversationNotFound } from './_components/conversation-not-found';
import { OfferPaymentReturnToast } from './_components/offer-payment-return-toast';
import { ConversationView } from './_components/conversation-view';
import { Header } from '../../_components/header';

interface ConversationPageProps {
  params: Promise<{ token: string }>;
}

export const metadata: Metadata = {
  title: 'Sua conversa',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { token } = await params;
  const conversation = await getClientConversation(token);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-6 pt-32 pb-14 md:pb-22">
        {conversation ? (
          <ConversationView token={token} initialConversation={conversation} />
        ) : (
          <ConversationNotFound />
        )}
      </main>

      <Suspense fallback={null}>
        <OfferPaymentReturnToast />
      </Suspense>
    </div>
  );
}
