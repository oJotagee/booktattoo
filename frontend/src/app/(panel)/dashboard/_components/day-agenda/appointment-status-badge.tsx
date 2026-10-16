import { cn } from 'cn';

import type { AppointmentStatus } from '../../_data-access/get-day-appointments';
import { Badge } from '@/components/ui/badge';

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
};

const STATUS_CLASS: Record<AppointmentStatus, string> = {
  PENDING: 'bg-yellow-500/15 text-yellow-500',
  CONFIRMED: 'bg-orange-600/15 text-orange-500',
  CANCELLED: 'bg-white/5 text-white/40',
  COMPLETED: 'bg-emerald-500/15 text-emerald-500',
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge className={cn('rounded-md', STATUS_CLASS[status])}>{STATUS_LABEL[status]}</Badge>;
}
