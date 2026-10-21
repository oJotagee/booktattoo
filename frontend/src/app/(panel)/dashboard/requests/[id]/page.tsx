import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { getCurrentUser } from '../../_data-access/get-current-user';
import { getBookingRequest } from '../_data-access/get-booking-request';
import { RequestThread } from '../_components/request-thread';
import DashboardHeader from '../../_components/header';

interface RequestPageProps {
  params: Promise<{ id: string }>;
}

export default async function RequestPage({ params }: RequestPageProps) {
  const { id } = await params;
  const [request, user] = await Promise.all([getBookingRequest(id), getCurrentUser()]);

  if (!request) notFound();

  return (
    <>
      <DashboardHeader title="Pedidos" subtitle={`Conversa com ${request.clientName}`} />

      <Link
        href="/dashboard/requests"
        className="mb-4 flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Voltar para pedidos
      </Link>

      <RequestThread
        initialRequest={request}
        artist={{ id: user.id, times: user.times, paymentsEnabled: user.paymentsEnabled }}
      />
    </>
  );
}
