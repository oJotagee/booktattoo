'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { CalendarX, ChevronDown, Eye, History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from 'cn';

import { type DayAppointment, getDayAppointments } from '../../_data-access/get-day-appointments';
import {
  buildOccupantMap,
  isDateParam,
  isSlotInThePast,
  SLOT_MINUTES,
  studioToday,
} from '@/lib/schedule';
import { AppointmentDetailsDialog } from './appointment-details-dialog';
import { AppointmentStatusBadge } from './appointment-status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DateButton } from './date-button';

interface DayAgendaListProps {
  times: string[];
}

type AgendaRow =
  | { kind: 'free'; time: string; past: boolean }
  | {
      kind: 'start';
      time: string;
      appointment: DayAppointment;
      endTime: string;
      reservedSlots: number;
    }
  | { kind: 'continuation'; time: string; appointment: DayAppointment };

const BLOCK_BORDER_CLASS: Record<DayAppointment['status'], string> = {
  PENDING: 'border-l-yellow-500/70',
  CONFIRMED: 'border-l-orange-600/80',
  COMPLETED: 'border-l-emerald-500/70',
  CANCELLED: 'border-l-white/20',
};

const REFETCH_INTERVAL_MS = 60_000;
const CLOCK_TICK_MS = 60_000;

function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return now;
}

export function DayAgendaList({ times }: DayAgendaListProps) {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');
  const date = isDateParam(dateParam) ? dateParam : studioToday();
  const [selected, setSelected] = useState<DayAppointment | null>(null);

  const now = useNow();
  const isPastDay = date < studioToday(now);

  const { data, isPending, isError } = useQuery({
    queryKey: ['day-appointments', date],
    queryFn: () => getDayAppointments({ date }),
    staleTime: 20_000,
    refetchInterval: REFETCH_INTERVAL_MS,
  });

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-serif text-lg">Agenda do dia</h2>
        <DateButton date={date} />
      </header>

      {isPastDay && (
        <p className="flex items-center gap-2 border-b bg-white/2 px-5 py-2.5 text-xs text-muted-foreground">
          <History className="size-3.5" />
          Este dia já passou — os horários livres não podem mais ser agendados.
        </p>
      )}

      {isPending ? (
        <DayAgendaRowsSkeleton rows={Math.min(times.length || 4, 6)} />
      ) : isError ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Não foi possível carregar a agenda. Tente novamente mais tarde.
        </p>
      ) : (
        <AgendaRows
          rows={buildRows(times, data, date, now)}
          onSelect={setSelected}
          hasTimes={times.length > 0}
        />
      )}

      <AppointmentDetailsDialog
        appointment={selected}
        date={date}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </section>
  );
}

function buildRows(
  times: string[],
  appointments: DayAppointment[],
  date: string,
  now: Date,
): AgendaRow[] {
  const occupants = buildOccupantMap(appointments, times);
  const slots = [...new Set([...times, ...appointments.map(({ time }) => time)])].sort();

  const lastSlotById = new Map<string, string>();
  const reservedSlotsById = new Map<string, number>();
  for (const time of slots) {
    const appointment = occupants.get(time);
    if (!appointment) continue;

    lastSlotById.set(appointment.id, time);
    if (appointment.time !== time) {
      reservedSlotsById.set(appointment.id, (reservedSlotsById.get(appointment.id) ?? 0) + 1);
    }
  }

  return slots.map<AgendaRow>((time) => {
    const appointment = occupants.get(time);

    if (!appointment) return { kind: 'free', time, past: isSlotInThePast(date, time, now) };
    if (appointment.time !== time) return { kind: 'continuation', time, appointment };

    const lastSlot = lastSlotById.get(appointment.id) ?? time;
    return {
      kind: 'start',
      time,
      appointment,
      endTime: addMinutes(lastSlot, SLOT_MINUTES),
      reservedSlots: reservedSlotsById.get(appointment.id) ?? 0,
    };
  });
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;

  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

interface AgendaRowsProps {
  rows: AgendaRow[];
  hasTimes: boolean;
  onSelect: (appointment: DayAppointment) => void;
}

function AgendaRows({ rows, hasTimes, onSelect }: AgendaRowsProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  function toggleBlock(id: string) {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
        <CalendarX className="size-6" />
        <p className="text-sm">
          {hasTimes
            ? 'Nenhum agendamento para este dia.'
            : 'Defina seus horários de atendimento no perfil para montar a agenda.'}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {rows.map((row) => {
        if (row.kind === 'free') {
          return (
            <li
              key={row.time}
              className="flex h-16 items-center gap-6 border-l-2 border-l-transparent px-5"
            >
              <SlotTime time={row.time} />
              {row.past ? (
                <>
                  <span className="flex-1 text-sm text-white/20">
                    Horário encerrado — não é possível agendar
                  </span>
                  <Badge className="rounded-md bg-white/5 text-white/20">Encerrado</Badge>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-white/25">Disponível</span>
                  <Badge className="rounded-md bg-white/5 text-white/30">Livre</Badge>
                </>
              )}
            </li>
          );
        }

        const { appointment } = row;
        const blockClass = cn(
          'flex h-16 items-center gap-6 border-l-2 bg-white/2 px-5',
          BLOCK_BORDER_CLASS[appointment.status],
        );

        const isCollapsed = collapsedIds.has(appointment.id);

        if (row.kind === 'continuation') {
          if (isCollapsed) return null;

          return (
            <li key={row.time} id={blockSlotsId(appointment.id, row.time)} className={blockClass}>
              <SlotTime time={row.time} />
              <p className="min-w-0 flex-1 truncate text-sm text-white/40">
                Reservado · {appointment.clientName}
              </p>
              <ViewButton appointment={appointment} slot={row.time} onSelect={onSelect} />
            </li>
          );
        }

        return (
          <li key={row.time} className={blockClass}>
            <SlotTime time={row.time} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{appointment.clientName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {appointment.galeryTitle ?? 'Agendamento'} · {row.time} – {row.endTime}
              </p>
            </div>
            {row.reservedSlots > 0 && (
              <Button
                variant="ghost"
                size="xs"
                className="cursor-pointer text-muted-foreground"
                aria-expanded={!isCollapsed}
                aria-controls={continuationIds(rows, appointment.id)}
                aria-label={
                  isCollapsed
                    ? `Mostrar horários reservados de ${appointment.clientName}`
                    : `Recolher horários reservados de ${appointment.clientName}`
                }
                onClick={() => toggleBlock(appointment.id)}
              >
                {row.reservedSlots} {row.reservedSlots === 1 ? 'horário' : 'horários'}
                <ChevronDown
                  className={cn('transition-transform duration-200', isCollapsed && '-rotate-90')}
                />
              </Button>
            )}
            <AppointmentStatusBadge status={appointment.status} />
            <ViewButton appointment={appointment} onSelect={onSelect} />
          </li>
        );
      })}
    </ul>
  );
}

function blockSlotsId(appointmentId: string, time: string) {
  return `agenda-${appointmentId}-${time.replace(':', '')}`;
}

function continuationIds(rows: AgendaRow[], appointmentId: string) {
  return rows
    .filter((row) => row.kind === 'continuation' && row.appointment.id === appointmentId)
    .map((row) => blockSlotsId(appointmentId, row.time))
    .join(' ');
}

function SlotTime({ time }: { time: string }) {
  return <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{time}</span>;
}

interface ViewButtonProps {
  appointment: DayAppointment;
  // Slot de continuação: entra no rótulo para cada botão ter um nome acessível único
  slot?: string;
  onSelect: (appointment: DayAppointment) => void;
}

function ViewButton({ appointment, slot, onSelect }: ViewButtonProps) {
  const label = `Ver agendamento de ${appointment.clientName}`;

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="cursor-pointer text-muted-foreground"
      aria-label={slot ? `${label} (horário ${slot})` : label}
      onClick={() => onSelect(appointment)}
    >
      <Eye />
    </Button>
  );
}

function DayAgendaRowsSkeleton({ rows }: { rows: number }) {
  return (
    <ul className="divide-y">
      {Array.from({ length: rows }).map((_, index) => (
        <li
          key={index}
          className="flex h-16 items-center gap-6 border-l-2 border-l-transparent px-5"
        >
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-16" />
        </li>
      ))}
    </ul>
  );
}

export function DayAgendaSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between border-b px-5 py-4">
        <h2 className="font-serif text-lg">Agenda do dia</h2>
        <Skeleton className="h-6 w-20" />
      </header>
      <DayAgendaRowsSkeleton rows={4} />
    </section>
  );
}
