'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2, Lock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { closeBookingRequest } from '../_actions/close-booking-request';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CloseRequestButtonProps {
  requestId: string;
  onClosed: () => Promise<void> | void;
}

export function CloseRequestButton({ requestId, onClosed }: CloseRequestButtonProps) {
  const [open, setOpen] = useState(false);

  const { mutateAsync: closeMutation, isPending } = useMutation({
    mutationFn: closeBookingRequest,
  });

  async function handleConfirm() {
    const response = await closeMutation(requestId);

    if (response.error) {
      toast.error(response.error);
      return;
    }

    toast.success('Conversa encerrada');
    setOpen(false);
    await onClosed();
  }

  return (
    <>
      <Button variant="destructive" className="cursor-pointer" onClick={() => setOpen(true)}>
        <Lock />
        Encerrar conversa
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar conversa?</DialogTitle>
            <DialogDescription>
              Depois de encerrada, nem você nem o cliente poderão mandar novas mensagens. O
              histórico continua disponível para leitura.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={isPending}
              onClick={handleConfirm}
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Encerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
