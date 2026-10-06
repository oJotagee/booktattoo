import type { UserEntity } from '@/domain/entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export type FindPublicArtistsParams = {
  limit: number;
  offset: number;
};

export type FindAllUsersParams = {
  limit: number;
  offset: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};

export interface UserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findPublicArtists(params: FindPublicArtistsParams): Promise<PaginatedResult<UserEntity>>;
  findAll(params: FindAllUsersParams): Promise<UserEntity[]>;
  create(user: UserEntity): Promise<void>;
  update(user: UserEntity): Promise<void>;
}
