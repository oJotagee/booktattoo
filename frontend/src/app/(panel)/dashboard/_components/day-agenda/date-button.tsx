'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

import { formatDateParam, studioToday } from '@/lib/schedule';
import { DatePicker } from '@/components/date-picker';

interface DateButtonProps {
  date: string;
}

export function DateButton({ date }: DateButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams);
    params.set('date', next);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <DatePicker
      value={date}
      today={studioToday()}
      onChange={handleChange}
      trigger={
        <button
          type="button"
          aria-label="Escolher data da agenda"
          className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <CalendarDays className="size-3.5" />
          {formatDateParam(date, { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </button>
      }
    />
  );
}
