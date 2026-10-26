'use client';

import { CalendarDays, CalendarCheck2, RefreshCw, Unplug } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import {
  connectCalendar,
  disconnectCalendar,
  getCalendarStatus,
  retryFailedCalendarSyncs,
} from '../_actions/google-calendar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CalendarStatus = {
  connected: boolean;
  status: string;
  pending: number;
  failed: number;
};

const DISCONNECTED: CalendarStatus = {
  connected: false,
  status: 'DISCONNECTED',
  pending: 0,
  failed: 0,
};

export function GoogleCalendarButton() {
  const [calendar, setCalendar] = useState<CalendarStatus>(DISCONNECTED);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getCalendarStatus()
      .then(setCalendar)
      .catch(() => setCalendar({ ...DISCONNECTED, status: 'UNAVAILABLE' }))
      .finally(() => setLoading(false));

    const params = new URLSearchParams(window.location.search);
    if (params.has('calendar')) {
      if (params.get('calendar') === 'connected') toast.success('Google Calendar conectado');
      else toast.error('Não foi possível conectar o Google Calendar');
      params.delete('calendar');
      const query = params.toString();
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${query ? `?${query}` : ''}`,
      );
    }
  }, []);

  function connect() {
    startTransition(async () => {
      try {
        const url = await connectCalendar();
        if (!url) {
          toast.error('Sessão expirada');
          return;
        }
        window.location.assign(url);
      } catch {
        toast.error('Não foi possível iniciar a conexão com o Google Calendar');
      }
    });
  }

  function disconnect() {
    startTransition(async () => {
      try {
        await disconnectCalendar();
        setCalendar(DISCONNECTED);
        toast.success('Google Calendar desconectado');
      } catch {
        toast.error('Não foi possível desconectar o Google Calendar');
      }
    });
  }

  function retryFailed() {
    startTransition(async () => {
      try {
        const retried = await retryFailedCalendarSyncs();
        setCalendar((current) => ({
          ...current,
          pending: current.pending + retried,
          failed: Math.max(0, current.failed - retried),
        }));
        toast.success('Sincronizações serão tentadas novamente');
      } catch {
        toast.error('Não foi possível reiniciar as sincronizações');
      }
    });
  }

  const Icon = calendar.connected ? CalendarCheck2 : CalendarDays;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="relative cursor-pointer"
            aria-label={
              calendar.connected ? 'Google Calendar conectado' : 'Conectar Google Calendar'
            }
            title={calendar.connected ? 'Google Calendar conectado' : 'Conectar Google Calendar'}
            disabled={loading}
          >
            <Icon />
            <span className="hidden sm:inline">Google Calendar</span>
            {calendar.connected && (
              <span className="absolute right-1 top-1 size-2 rounded-full bg-green-500" />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Google Calendar</DropdownMenuLabel>
        </DropdownMenuGroup>
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          {loading
            ? 'Consultando conexão…'
            : calendar.connected
              ? 'Sua agenda está conectada.'
              : calendar.status === 'REAUTH_REQUIRED'
                ? 'A autorização expirou. Conecte novamente.'
                : calendar.status === 'UNAVAILABLE'
                  ? 'Não foi possível consultar a integração.'
                  : 'Receba automaticamente os agendamentos confirmados na sua agenda.'}
        </div>
        {(calendar.pending > 0 || calendar.failed > 0) && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            {calendar.pending} aguardando · {calendar.failed} com falha
          </div>
        )}
        <DropdownMenuSeparator />
        {calendar.connected ? (
          <DropdownMenuItem disabled={pending} onClick={disconnect} variant="destructive">
            <Unplug />
            Desconectar
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem disabled={pending || loading} onClick={connect}>
            <CalendarDays />
            {calendar.status === 'REAUTH_REQUIRED' ? 'Reconectar agenda' : 'Conectar agenda'}
          </DropdownMenuItem>
        )}
        {calendar.failed > 0 && (
          <DropdownMenuItem disabled={pending} onClick={retryFailed}>
            <RefreshCw />
            Tentar falhas novamente
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
