import { ServiceEntity } from '@/domain/entities/service.entity';

export function buildService(
  overrides: Partial<{
    id: string;
    name: string;
    duration: number;
    depositAmount: number;
    userId: string;
  }> = {},
): ServiceEntity {
  return ServiceEntity.create({
    id: overrides.id ?? 'service-1',
    name: overrides.name ?? 'Tatuagem Fineline',
    duration: overrides.duration ?? 60,
    depositAmount: overrides.depositAmount ?? 5000,
    userId: overrides.userId ?? 'user-1',
  });
}
