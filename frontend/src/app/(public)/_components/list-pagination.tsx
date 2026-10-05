import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from 'cn';

import { Button } from '@/components/ui/button';

interface ListPaginationProps {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  disabled?: boolean;
  className?: string;
  onPageChange: (page: number) => void;
}

export function ListPagination({
  page,
  perPage,
  total,
  totalPages,
  disabled,
  className,
  onPageChange,
}: ListPaginationProps) {
  if (total === 0) return null;

  const lastPage = Math.max(totalPages, 1);
  const firstItem = (page - 1) * perPage + 1;
  const lastItem = Math.min(page * perPage, total);

  return (
    <div className={cn('flex items-center justify-between gap-4 sm:justify-end', className)}>
      <span className="text-sm text-white/50">
        {firstItem}–{lastItem} de {total}
      </span>

      <div className="flex items-center gap-2 text-white">
        <Button
          variant="outline"
          size="icon-sm"
          className="cursor-pointer"
          aria-label="Página anterior"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || disabled}
        >
          <ChevronLeft />
        </Button>
        <span className="text-sm">
          {page} / {lastPage}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          className="cursor-pointer"
          aria-label="Próxima página"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage || disabled}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
