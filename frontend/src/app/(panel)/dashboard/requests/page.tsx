import { Suspense } from 'react';

import { RequestsPageSkeleton } from './_components/requests-page-skeleton';
import { getBookingRequests } from './_data-access/get-booking-requests';
import type { ConversationStatus } from '@/components/conversation/types';
import { RequestList } from './_components/request-list';
import DashboardHeader from '../_components/header';

const PAGE_SIZE = 10;

const SUBTITLE = 'Conversas com clientes que pediram algo fora da galeria';

interface RequestsPageProps {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default function RequestsPage({ searchParams }: RequestsPageProps) {
  return (
    <>
      <DashboardHeader title="Pedidos" subtitle={SUBTITLE} />

      <h1 className="text-xl font-bold md:hidden">Pedidos</h1>
      <h2 className="text-white/30 text-sm mb-4 md:hidden">{SUBTITLE}</h2>

      <Suspense fallback={<RequestsPageSkeleton items={4} />}>
        <RequestsPageList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function RequestsPageList({ searchParams }: RequestsPageProps) {
  const { page, status } = await searchParams;
  const currentPage = Math.max(Number(page) || 1, 1);
  const currentStatus: ConversationStatus = status === 'CLOSED' ? 'CLOSED' : 'OPEN';

  const requests = await getBookingRequests({
    status: currentStatus,
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  return (
    <RequestList requests={requests.list} pagination={requests.pagination} status={currentStatus} />
  );
}
