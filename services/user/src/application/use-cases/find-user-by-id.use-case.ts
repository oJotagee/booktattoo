import { Inject, Injectable } from '@nestjs/common';

import { UserNotFoundError } from '@/domain/errors/user.error';

import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';

type FindUserByIdOutput = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class FindUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute({ id }: { id: string }): Promise<FindUserByIdOutput> {
    const user = await this.users.findById(id);

    if (!user) throw new UserNotFoundError(id);

    return {
      id: user.id,
      name: user.name,
      email: user.email.toString(),
      image: user.image,
      address: user.address,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
