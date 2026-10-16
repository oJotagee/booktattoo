'use client';

import { ptBR } from 'react-day-picker/locale';
import { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  trigger: React.ReactElement;
  today?: string;
  minDate?: string;
  align?: 'start' | 'center' | 'end';
}

// O Calendar trabalha com Date no fuso local; convertemos pelas partes da data
// para que "2026-10-16" nunca vire 15/10 por causa do UTC
function toLocalDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);

  return new Date(year, month - 1, day);
}

function toDateParam(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}

export function DatePicker({
  value,
  onChange,
  trigger,
  today,
  minDate,
  align = 'end',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = toLocalDate(value);

  function handleSelect(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          required
          disabled={minDate ? { before: toLocalDate(minDate) } : undefined}
          onSelect={(date) => date && handleSelect(toDateParam(date))}
        />

        {today && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full cursor-pointer"
              disabled={value === today}
              onClick={() => handleSelect(today)}
            >
              Hoje
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
