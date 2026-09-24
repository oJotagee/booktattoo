import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const HEADERS = ['Serviço', 'Duração', 'Depósito mínimo', 'Status', ''];

interface ServiceTableSkeletonRowsProps {
  rows: number;
}

export function ServiceTableSkeletonRows({ rows }: ServiceTableSkeletonRowsProps) {
  return Array.from({ length: rows }).map((_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      <TableCell className="h-14 px-5">
        <Skeleton className="h-4 w-35" />
      </TableCell>
      <TableCell className="h-14 px-5">
        <Skeleton className="h-4 w-10" />
      </TableCell>
      <TableCell className="h-14 px-5">
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell className="h-14 px-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-[18px] w-8 rounded-full" />
          <Skeleton className="h-4 w-10" />
        </div>
      </TableCell>
      <TableCell className="h-14 px-5">
        <Skeleton className="ml-auto size-7" />
      </TableCell>
    </TableRow>
  ));
}

export function ServiceTableSkeleton({ rows }: ServiceTableSkeletonRowsProps) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {HEADERS.map((header) => (
                <TableHead
                  key={header}
                  className="h-12 px-5 text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            <ServiceTableSkeletonRows rows={rows} />
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-full sm:w-36" />
        <Skeleton className="h-8 w-44 self-end" />
      </div>
    </div>
  );
}
