'use client';

import { useMutation } from '@tanstack/react-query';
import { Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Galery } from '../_data-access/get-all-galeries';
import { deleteGalery } from '../_actions/delete-galery';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GaleryDeleteButtonProps {
  galery: Galery;
}

export function GaleryDeleteButton({ galery }: GaleryDeleteButtonProps) {
  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: deleteGalery,
    onSuccess: (response) => {
      if (response.error) {
        toast.error(response.error);
        return;
      }

      setOpen(false);
      toast.success('Item excluído com sucesso');
    },
    onError: () => toast.error('Não foi possível excluir o item'),
  });

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        className="cursor-pointer text-muted-foreground hover:text-red-500"
        aria-label={`Excluir ${galery.title}`}
        onClick={() => setOpen(true)}
      >
        <Trash2 />
      </Button>

      <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Excluir item</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir &quot;{galery.title}&quot;? Essa ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" className="cursor-pointer" />}
              disabled={isPending}
            >
              Cancelar
            </DialogClose>
            <Button
              className="cursor-pointer bg-red-600 font-semibold text-white hover:brightness-75 duration-300"
              onClick={() => mutate(galery.id)}
              disabled={isPending}
            >
              {isPending && <Loader2 className="animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
