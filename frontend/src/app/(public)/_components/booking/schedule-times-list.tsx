import { cn } from 'cn';

import { isSlotInThePast, isSlotSequenceAvailable, requiredSlots } from '@/lib/schedule';
import { Skeleton } from '@/components/ui/skeleton';

interface ScheduleTimesListProps {
  date: string;
  times: string[];
  blockedTimes: string[];
  duration: number;
  selectedTime: string;
  isLoading: boolean;
  onSelectTime: (time: string) => void;
}

export function ScheduleTimesList({
  date,
  times,
  blockedTimes,
  duration,
  selectedTime,
  isLoading,
  onSelectTime,
}: ScheduleTimesListProps) {
  if (!date) {
    return <p className="text-sm text-white/40">Escolha uma data para ver os horários.</p>;
  }

  if (!times.length) {
    return <p className="text-sm text-white/40">Este tatuador ainda não definiu horários.</p>;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {times.slice(0, 8).map((time) => (
          <Skeleton key={time} className="h-9" />
        ))}
      </div>
    );
  }

  const slots = requiredSlots(duration);

  return (
    <fieldset className="grid grid-cols-2 gap-2" aria-label="Horários disponíveis">
      {times.map((time) => {
        const enabled =
          isSlotSequenceAvailable(time, slots, times, blockedTimes) && !isSlotInThePast(date, time);
        const selected = selectedTime === time;

        return (
          <button
            key={time}
            type="button"
            aria-pressed={selected}
            disabled={!enabled}
            onClick={() => onSelectTime(time)}
            className={cn(
              'h-9 cursor-pointer rounded-lg border text-sm text-white transition-colors duration-200',
              selected
                ? 'border-orange-600 bg-orange-600/15 text-orange-500'
                : 'bg-card hover:border-white/30',
              'disabled:cursor-not-allowed disabled:text-white/20 disabled:line-through disabled:hover:border-border',
            )}
          >
            {time}
          </button>
        );
      })}
    </fieldset>
  );
}
