'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  type ClientConversation,
  getClientConversation,
} from '../../../_data-access/get-client-conversation';
import { formatMessageDate } from '@/components/conversation/format-message-date';
import { MessageList } from '@/components/conversation/message-list';
import { MessageComposer } from '@/components/conversation/message-composer';
import { sendClientMessage } from '../../../_actions/send-client-message';
import { ConversationNotFound } from './conversation-not-found';
import { CopyConversationLink } from './copy-conversation-link';
import { BookingOfferCard } from './booking-offer-card';

const POLLING_INTERVAL_MS = 15_000;

interface ConversationViewProps {
  token: string;
  initialConversation: ClientConversation;
}

export function ConversationView({ token, initialConversation }: ConversationViewProps) {
  const queryClient = useQueryClient();
  const queryKey = ['client-conversation', token];

  const { data: conversation } = useQuery({
    queryKey,
    queryFn: () => getClientConversation(token),
    initialData: initialConversation,
    refetchInterval: (query) => (query.state.data?.status === 'OPEN' ? POLLING_INTERVAL_MS : false),
    refetchOnWindowFocus: true,
  });

  const { mutateAsync: sendMessageMutation, isPending } = useMutation({
    mutationFn: sendClientMessage,
  });

  if (!conversation) return <ConversationNotFound />;

  async function handleSend(body: string) {
    const response = await sendMessageMutation({ token, body });

    if (response.error || !response.data) {
      toast.error(response.error ?? 'Não foi possível enviar a mensagem');
      await queryClient.invalidateQueries({ queryKey });
      return false;
    }

    const message = response.data;
    queryClient.setQueryData<ClientConversation | null>(queryKey, (current) =>
      current ? { ...current, messages: [...current.messages, message] } : current,
    );
    await queryClient.invalidateQueries({ queryKey });

    return true;
  }

  const closed = conversation.status === 'CLOSED';
  const offer = conversation.offer?.status === 'WITHDRAWN' ? null : conversation.offer;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-white/10 pb-6">
        <p className="text-sm uppercase tracking-widest text-orange-600/80">Sua conversa</p>
        <h1 className="text-3xl font-semibold text-white md:text-4xl">
          Conversa com{' '}
          <Link href={`/${conversation.artistId}`} className="capitalize text-orange-600 italic">
            {conversation.artistName}
          </Link>
        </h1>
        <p className="text-sm text-white/50">
          Iniciada em {formatMessageDate(conversation.createdAt)}
        </p>
      </header>

      <CopyConversationLink />

      {offer && (
        <BookingOfferCard
          token={token}
          offer={offer}
          onPaymentFailed={() => queryClient.invalidateQueries({ queryKey })}
        />
      )}

      <section
        aria-label="Histórico da conversa"
        className="rounded-2xl border border-white/10 p-4"
      >
        <MessageList
          messages={conversation.messages}
          viewer="CLIENT"
          authorNames={{ ARTIST: conversation.artistName, CLIENT: conversation.clientName }}
          className="max-h-[60vh] overflow-y-auto pr-1"
        />
      </section>

      {closed ? (
        <p className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          <Lock className="mt-0.5 size-4 shrink-0 text-orange-600" />
          <span>
            Esta conversa foi encerrada
            {conversation.closedAt && ` em ${formatMessageDate(conversation.closedAt)}`}. Você ainda
            pode ler o histórico, mas não é possível enviar novas mensagens.
          </span>
        </p>
      ) : (
        <MessageComposer
          placeholder={`Escreva para ${conversation.artistName.split(' ')[0]}`}
          isPending={isPending}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
