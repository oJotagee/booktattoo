'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { updateGaleryAvailability } from '../_actions/update-galery-availability';
import type { Galery } from '../_data-access/get-all-galeries';
import { Switch } from '@/components/ui/switch';

interface GaleryAvailabilitySwitchProps {
  galery: Galery;
}

export function GaleryAvailabilitySwitch({ galery }: GaleryAvailabilitySwitchProps) {
  const [checked, setChecked] = useState(galery.available);
  const [serverAvailable, setServerAvailable] = useState(galery.available);

  if (galery.available !== serverAvailable) {
    setServerAvailable(galery.available);
    setChecked(galery.available);
  }

  const { mutate: changeAvailability, isPending } = useMutation({
    mutationFn: updateGaleryAvailability,
    onSuccess: (response, { available }) => {
      if (response.error) {
        setChecked(!available);
        toast.error(response.error);
        return;
      }

      toast.success(available ? 'Flash disponível' : 'Flash indisponível');
    },
    onError: (_error, { available }) => {
      setChecked(!available);
      toast.error('Não foi possível atualizar a disponibilidade do flash');
    },
  });

  function handleCheckedChange(available: boolean) {
    if (isPending) return;

    setChecked(available);
    changeAvailability({ id: galery.id, available });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        size="sm"
        checked={checked}
        onCheckedChange={handleCheckedChange}
        aria-label={checked ? 'Marcar como indisponível' : 'Marcar como disponível'}
        aria-busy={isPending}
        className="data-checked:bg-orange-600"
      />
      <span className="text-xs text-muted-foreground">
        {checked ? 'Disponível' : 'Indisponível'}
      </span>
    </div>
  );
}
