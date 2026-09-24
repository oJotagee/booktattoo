import { createColumnHelper, rowPaginationFeature, tableFeatures } from '@tanstack/react-table';
import { Pencil } from 'lucide-react';

import { formatCurrency, formatDuration } from '@/utils/formatService';
import type { Service } from '../_data_access/get-all-services';
import { ServiceStatusSwitch } from './service-status-switch';
import { Button } from '@/components/ui/button';

export const serviceTableFeatures = tableFeatures({ rowPaginationFeature });

const helper = createColumnHelper<typeof serviceTableFeatures, Service>();

export function getServiceColumns(onEdit: (service: Service) => void) {
  return helper.columns([
    helper.accessor('name', {
      header: 'Serviço',
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    helper.accessor('duration', {
      header: 'Duração',
      cell: (info) => (
        <span className="text-muted-foreground">{formatDuration(info.getValue())}</span>
      ),
    }),
    helper.accessor('depositAmount', {
      header: 'Depósito mínimo',
      cell: (info) => <span className="font-medium">{formatCurrency(info.getValue())}</span>,
    }),
    helper.accessor('status', {
      header: 'Status',
      cell: (info) => <ServiceStatusSwitch service={info.row.original} />,
    }),
    helper.display({
      id: 'actions',
      header: () => <span className="sr-only">Ações</span>,
      cell: (info) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer text-muted-foreground"
            aria-label={`Editar ${info.row.original.name}`}
            onClick={() => onEdit(info.row.original)}
          >
            <Pencil />
          </Button>
        </div>
      ),
    }),
  ]);
}
