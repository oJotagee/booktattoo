import Link from 'next/link';

import type { BookingRequestSummary } from '../_data-access/get-booking-requests';
import { formatMessageDate } from '@/components/conversation/format-message-date';
import { Badge } from '@/components/ui/badge';

interface RequestCardProps {
  request: BookingRequestSummary;
}

export function RequestCard({ request }: RequestCardProps) {
  const { lastMessage } = request;
  const preview = lastMessage
    ? `${lastMessage.author === 'ARTIST' ? 'Você: ' : ''}${lastMessage.body}`
    : 'Sem mensagens';

  return (
    <li>
      <Link
        href={`/dashboard/requests/${request.id}`}
        className="flex flex-col gap-2 rounded-xl border bg-card px-5 py-4 transition-colors duration-200 hover:border-white/30"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-semibold capitalize">{request.clientName}</h3>
            {request.status === 'OPEN' && request.awaitingReply && (
              <Badge className="bg-orange-600 text-white">Aguardando resposta</Badge>
            )}
          </div>
          <time dateTime={request.lastMessageAt} className="shrink-0 text-xs text-muted-foreground">
            {formatMessageDate(request.lastMessageAt)}
          </time>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{preview}</p>
      </Link>
    </li>
  );
}
