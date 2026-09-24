'use client';

import type { Service } from '../_data_access/get-all-services';
import { ServiceForm } from './service-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}

export function ServiceDialog({ open, onOpenChange, service }: ServiceDialogProps) {
  const isEditing = !!service;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edite o serviço existente.' : 'Adicione um novo serviço.'}
          </DialogDescription>
        </DialogHeader>

        <ServiceForm
          key={service?.id ?? 'new'}
          service={service}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
