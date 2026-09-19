import { Inject, Injectable } from '@nestjs/common';

import { UserNotFoundError } from '@/domain/errors/user.error';

import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';

type UpdateUserContactInfoInput = {
  userId: string;
  name?: string;
  address?: string | null;
  phone?: string | null;
  bio?: string | null;
  times?: string[];
};

type UpdateUserContactInfoOutput = {
  id: string;
  name: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  bio: string | null;
  times: string[];
  updatedAt: Date;
};

@Injectable()
export class UpdateUserContactInfoUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute({
    userId,
    ...input
  }: UpdateUserContactInfoInput): Promise<UpdateUserContactInfoOutput> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const updatedUser = user.updateContactInfo({
      name: input.name,
      address: input.address,
      phone: input.phone,
      bio: input.bio,
      times: input.times,
    });

    await this.users.update(updatedUser);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      image: updatedUser.image,
      address: updatedUser.address,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
      times: updatedUser.times,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
