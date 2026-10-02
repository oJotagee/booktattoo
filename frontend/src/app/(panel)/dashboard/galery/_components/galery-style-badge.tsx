import { cn } from 'cn';

import { formatGaleryStyle, galeryStyleBadgeClass, type GaleryStyle } from '@/utils/formatGalery';
import { Badge } from '@/components/ui/badge';

interface GaleryStyleBadgeProps {
  style: GaleryStyle;
  className?: string;
}

export function GaleryStyleBadge({ style, className }: GaleryStyleBadgeProps) {
  return (
    <Badge className={cn('font-semibold', galeryStyleBadgeClass(style), className)}>
      {formatGaleryStyle(style)}
    </Badge>
  );
}
