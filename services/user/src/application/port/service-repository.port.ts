import type { ServiceEntity } from '@/domain/entities/service.entity';

export const SERVICE_REPOSITORY = Symbol('SERVICE_REPOSITORY');

export type FindByUserIdParams = {
  userId: string;
  limit: number;
  offset: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};

export interface ServiceRepository {
  findById(id: string): Promise<ServiceEntity | null>;
  findByUserId(params: FindByUserIdParams): Promise<PaginatedResult<ServiceEntity>>;
  create(service: ServiceEntity): Promise<void>;
  update(service: ServiceEntity): Promise<void>;
}
