import { Inject, Injectable } from '@nestjs/common';

import type { UserRepository } from '../../port/user-repository.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { UserNotFoundError } from '@/domain/errors/user.error';

type FindUserByIdOutput = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  address: string | null;
  showAddress: boolean;
  phone: string | null;
  bio: string | null;
  role: string | null;
  status: string;
  times: string[];
  paymentsEnabled: boolean;
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
      showAddress: user.showAddress,
      phone: user.phone,
      bio: user.bio,
      role: user.role,
      status: user.status,
      times: user.times,
      paymentsEnabled: user.paymentsEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
