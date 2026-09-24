'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { updateServiceStatus } from '../_actions/update-service-status';
import type { Service } from '../_data_access/get-all-services';
import { Switch } from '@/components/ui/switch';

interface ServiceStatusSwitchProps {
  service: Service;
}

export function ServiceStatusSwitch({ service }: ServiceStatusSwitchProps) {
  const [checked, setChecked] = useState(service.status);
  const [serverStatus, setServerStatus] = useState(service.status);

  if (service.status !== serverStatus) {
    setServerStatus(service.status);
    setChecked(service.status);
  }

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: updateServiceStatus,
    onSuccess: (response, { status }) => {
      if (response.error) {
        setChecked(!status);
        toast.error(response.error);
        return;
      }

      toast.success(status ? 'Serviço ativado' : 'Serviço desativado');
    },
    onError: (_error, { status }) => {
      setChecked(!status);
      toast.error('Não foi possível atualizar o status do serviço');
    },
  });

  function handleCheckedChange(status: boolean) {
    if (isPending) return;

    setChecked(status);
    changeStatus({ id: service.id, status });
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={handleCheckedChange}
        aria-label={checked ? 'Desativar serviço' : 'Ativar serviço'}
        aria-busy={isPending}
        className="data-checked:bg-orange-600"
      />
      <span className="text-sm text-muted-foreground">{checked ? 'Ativo' : 'Inativo'}</span>
    </div>
  );
}
