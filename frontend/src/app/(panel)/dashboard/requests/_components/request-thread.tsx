'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

import { formatMessageDate } from '@/components/conversation/format-message-date';
import { MessageComposer } from '@/components/conversation/message-composer';
import type { BookingRequestDetail } from '../_data-access/get-booking-requests';
import { MessageList } from '@/components/conversation/message-list';
import { getBookingRequest } from '../_data-access/get-booking-request';
import { sendArtistMessage } from '../_actions/send-artist-message';
import { CloseRequestButton } from './close-request-button';
import { ClientContact } from './client-contact';
import { OfferSection } from './offer-section';

const POLLING_INTERVAL_MS = 15_000;

interface RequestThreadProps {
  initialRequest: BookingRequestDetail;
  artist: { id: string; times: string[]; paymentsEnabled: boolean };
}

export function RequestThread({ initialRequest, artist }: RequestThreadProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const queryKey = ['booking-request', initialRequest.id];

  const { data } = useQuery({
    queryKey,
    queryFn: () => getBookingRequest(initialRequest.id),
    initialData: initialRequest,
    refetchInterval: (query) => (query.state.data?.status === 'OPEN' ? POLLING_INTERVAL_MS : false),
    refetchOnWindowFocus: true,
  });

  const { mutateAsync: sendMessageMutation, isPending } = useMutation({
    mutationFn: sendArtistMessage,
  });

  const request = data ?? initialRequest;
  const closed = request.status === 'CLOSED';

  async function handleSend(body: string) {
    const response = await sendMessageMutation({ id: request.id, body });

    if (response.error || !response.data) {
      toast.error(response.error ?? 'Não foi possível enviar a mensagem');
      await queryClient.invalidateQueries({ queryKey });
      return false;
    }

    const message = response.data;
    queryClient.setQueryData<BookingRequestDetail | null>(queryKey, (current) =>
      current ? { ...current, messages: [...current.messages, message] } : current,
    );
    await queryClient.invalidateQueries({ queryKey });

    return true;
  }

  async function handleClosed() {
    await queryClient.invalidateQueries({ queryKey });
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <section
        aria-label={`Conversa com ${request.clientName}`}
        className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4"
      >
        <MessageList
          messages={request.messages}
          viewer="ARTIST"
          authorNames={{ ARTIST: 'Você', CLIENT: request.clientName }}
          className="max-h-[60vh] overflow-y-auto pr-1"
        />

        {closed ? (
          <p className="flex items-start gap-3 rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0 text-orange-600" />
            <span>
              Conversa encerrada
              {request.closedAt && ` em ${formatMessageDate(request.closedAt)}`}. O histórico
              continua disponível para você e para o cliente.
            </span>
          </p>
        ) : (
          <MessageComposer
            placeholder={`Responder ${request.clientName.split(' ')[0]}`}
            isPending={isPending}
            onSend={handleSend}
          />
        )}
      </section>

      <aside className="flex flex-col gap-4">
        <ClientContact
          name={request.clientName}
          email={request.clientEmail}
          phone={request.clientPhone}
          createdAt={request.createdAt}
        />

        <OfferSection
          requestId={request.id}
          artistId={artist.id}
          times={artist.times}
          paymentsEnabled={artist.paymentsEnabled}
          closed={closed}
          offer={request.offer}
          onChanged={() => queryClient.invalidateQueries({ queryKey })}
        />

        {!closed && <CloseRequestButton requestId={request.id} onClosed={handleClosed} />}
      </aside>
    </div>
  );
}
