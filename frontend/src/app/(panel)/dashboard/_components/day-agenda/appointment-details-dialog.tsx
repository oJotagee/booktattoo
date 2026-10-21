'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MessagesSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import type { DayAppointment } from '../../_data-access/get-day-appointments';
import { formatCurrency, formatDuration } from '@/utils/formatService';
import { cancelAppointment } from '../../_actions/cancel-appointment';
import { AppointmentStatusBadge } from './appointment-status-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { formatPhone } from '@/utils/formatPhone';
import { formatDateParam } from '@/lib/schedule';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AppointmentDetailsDialogProps {
  appointment: DayAppointment | null;
  date: string;
  onOpenChange: (open: boolean) => void;
}

export function AppointmentDetailsDialog({
  appointment,
  date,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutateAsync: cancelMutation, isPending } = useMutation({
    mutationFn: cancelAppointment,
  });

  async function handleCancel() {
    if (!appointment) return;

    const response = await cancelMutation(appointment.id);

    if (response.error) {
      toast.error(response.error);
      return;
    }

    toast.success(
      appointment.paidAt ? 'Agendamento cancelado e sinal estornado' : 'Agendamento cancelado',
    );
    await queryClient.invalidateQueries({ queryKey: ['day-appointments'] });
    router.refresh();
    onOpenChange(false);
  }

  const canCancel = appointment?.status === 'PENDING' || appointment?.status === 'CONFIRMED';

  return (
    <Dialog open={!!appointment} onOpenChange={onOpenChange}>
      <DialogContent>
        {appointment && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle className="font-serif text-xl font-normal">
                  {appointment.clientName}
                </DialogTitle>
                <AppointmentStatusBadge status={appointment.status} />
              </div>
              <DialogDescription>
                {formatDateParam(date)} às {appointment.time} ·{' '}
                {formatDuration(appointment.duration)}
              </DialogDescription>
            </DialogHeader>

            {appointment.galeryTitle && (
              <div className="flex items-center gap-3 rounded-lg border p-3">
                {appointment.galeryImageUrl && (
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={appointment.galeryImageUrl}
                      alt={appointment.galeryTitle}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="font-medium">{appointment.galeryTitle}</p>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <DetailItem label="E-mail" value={appointment.clientEmail} />
              <DetailItem label="Telefone" value={formatPhone(appointment.clientPhone)} />
              <DetailItem label="Valor total" value={formatCurrency(appointment.price)} />
              <DetailItem
                label="Sinal"
                value={`${formatCurrency(appointment.depositAmount)} · ${depositLabel(appointment)}`}
              />
            </dl>

            {appointment.bookingRequestId && (
              <Link
                href={`/dashboard/requests/${appointment.bookingRequestId}`}
                className={buttonVariants({ variant: 'outline', className: 'w-fit' })}
              >
                <MessagesSquare />
                Ver conversa
              </Link>
            )}

            {canCancel && appointment.paidAt && (
              <p className="text-sm text-muted-foreground">
                Ao cancelar, o sinal de {formatCurrency(appointment.depositAmount)} será estornado
                ao cliente automaticamente.
              </p>
            )}

            {canCancel && (
              <DialogFooter>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  disabled={isPending}
                  onClick={handleCancel}
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Cancelar agendamento
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function depositLabel({ paidAt, refundedAt }: DayAppointment): string {
  if (refundedAt) return 'estornado';

  return paidAt ? 'pago' : 'aguardando';
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate">{value}</dd>
    </div>
  );
}
