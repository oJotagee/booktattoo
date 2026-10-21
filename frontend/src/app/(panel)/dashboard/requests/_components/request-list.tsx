'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, MessageSquareDashed } from 'lucide-react';
import { useTransition } from 'react';
import { cn } from 'cn';

import type {
  BookingRequestSummary,
  PaginationBookingRequest,
} from '../_data-access/get-booking-requests';
import type { ConversationStatus } from '@/components/conversation/types';
import { RequestCardSkeletons } from './requests-page-skeleton';
import { Button } from '@/components/ui/button';
import { RequestCard } from './request-card';

const STATUS_TABS: { value: ConversationStatus; label: string }[] = [
  { value: 'OPEN', label: 'Abertas' },
  { value: 'CLOSED', label: 'Encerradas' },
];

interface RequestListProps {
  requests: BookingRequestSummary[];
  pagination: PaginationBookingRequest;
  status: ConversationStatus;
}

export function RequestList({ requests, pagination, status }: RequestListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();

  function navigate(update: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams);
    update(params);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  function handleStatusChange(next: ConversationStatus) {
    navigate((params) => {
      params.delete('page');
      if (next === 'CLOSED') params.set('status', next);
      else params.delete('status');
    });
  }

  function handlePageChange(page: number) {
    navigate((params) => params.set('page', String(page)));
  }

  const totalPages = Math.max(pagination.totalPages, 1);
  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.perPage + 1;
  const lastItem = Math.min(pagination.page * pagination.perPage, pagination.total);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div role="tablist" aria-label="Filtrar conversas" className="flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              'h-8 cursor-pointer rounded-full border px-4 text-sm font-medium transition-colors duration-200',
              status === tab.value
                ? 'border-orange-600 bg-orange-600 text-white'
                : 'bg-card text-muted-foreground hover:border-white/30 hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isNavigating ? (
        <div className="flex flex-col gap-3">
          <RequestCardSkeletons items={Math.max(requests.length, 1)} />
        </div>
      ) : requests.length ? (
        <ul className="flex flex-col gap-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <MessageSquareDashed className="size-8" />
          <p>{status === 'OPEN' ? 'Nenhuma conversa aberta.' : 'Nenhuma conversa encerrada.'}</p>
        </div>
      )}

      {pagination.total > 0 && (
        <div className="mt-auto flex items-center justify-between gap-4 pt-4 sm:justify-end">
          <span className="text-sm text-muted-foreground">
            {firstItem}–{lastItem} de {pagination.total}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              className="cursor-pointer"
              aria-label="Página anterior"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || isNavigating}
            >
              <ChevronLeft />
            </Button>
            <span className="text-sm">
              {pagination.page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              className="cursor-pointer"
              aria-label="Próxima página"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages || isNavigating}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
