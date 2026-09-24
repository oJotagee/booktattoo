'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';
import { type PaginationState, useTable } from '@tanstack/react-table';

import type { PaginationService, Service } from '../_data_access/get-all-services';
import { getServiceColumns, serviceTableFeatures } from './columns';
import { ServiceTableSkeletonRows } from './service-table-skeleton';
import { ServiceDialog } from './service-dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ServiceListProps {
  services: Service[];
  pagination: PaginationService;
}

export function ServiceList({ services, pagination }: ServiceListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const columns = useMemo(
    () =>
      getServiceColumns((service) => {
        setEditingService(service);
        setIsDialogOpen(true);
      }),
    [],
  );

  const paginationState: PaginationState = {
    pageIndex: pagination.page - 1,
    pageSize: pagination.perPage,
  };

  function handlePaginationChange(
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) {
    const next = typeof updater === 'function' ? updater(paginationState) : updater;
    const params = new URLSearchParams(searchParams);

    params.set('page', String(next.pageIndex + 1));
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const table = useTable({
    features: serviceTableFeatures,
    columns,
    data: services,
    getRowId: (row) => row.id,
    manualPagination: true,
    rowCount: pagination.total,
    state: { pagination: paginationState },
    onPaginationChange: handlePaginationChange,
  });

  function handleCreate() {
    setEditingService(null);
    setIsDialogOpen(true);
  }

  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.perPage + 1;
  const lastItem = Math.min(pagination.page * pagination.perPage, pagination.total);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 px-5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isNavigating ? (
              <ServiceTableSkeletonRows rows={Math.max(services.length, 1)} />
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="h-14 px-5">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Nenhum serviço cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          onClick={handleCreate}
          className="w-full sm:w-fit bg-orange-600 text-white hover:brightness-75 duration-300 cursor-pointer"
        >
          <Plus />
          Novo serviço
        </Button>

        {pagination.total > 0 && (
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-sm text-muted-foreground">
              {firstItem}–{lastItem} de {pagination.total}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                className="cursor-pointer"
                aria-label="Página anterior"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage() || isNavigating}
              >
                <ChevronLeft />
              </Button>
              <span className="text-sm">
                {pagination.page} / {Math.max(table.getPageCount(), 1)}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                className="cursor-pointer"
                aria-label="Próxima página"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage() || isNavigating}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ServiceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} service={editingService} />
    </div>
  );
}
