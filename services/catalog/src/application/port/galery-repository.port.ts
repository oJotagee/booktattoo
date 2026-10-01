import type { FindByUserIdParams, PaginatedResult } from './service-repository.port';
import type { GaleryEntity } from '@/domain/entities/galery.entity';

export const GALERY_REPOSITORY = Symbol('GALERY_REPOSITORY');

export interface GaleryRepository {
  findById(id: string): Promise<GaleryEntity | null>;
  findByUserId(params: FindByUserIdParams): Promise<PaginatedResult<GaleryEntity>>;
  create(galery: GaleryEntity): Promise<void>;
  update(galery: GaleryEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
