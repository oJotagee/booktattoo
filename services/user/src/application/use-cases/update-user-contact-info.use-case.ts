import { Inject, Injectable } from '@nestjs/common';

import { UserNotFoundError } from '@/domain/errors/user.error';
import { Email } from '@/domain/value-objects/email.vo';

import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';

type UpdateUserContactInfoInput = {
  userId: string;
  name?: string;
  email?: string;
  image?: string | null;
  address?: string | null;
  phone?: string | null;
};

type UpdateUserContactInfoOutput = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  address: string | null;
  phone: string | null;
  updatedAt: Date;
};

@Injectable()
export class UpdateUserContactInfoUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
  ) {}

  async execute({ userId, ...input }: UpdateUserContactInfoInput): Promise<UpdateUserContactInfoOutput> {
    const user = await this.users.findById(userId);
    if (!user) throw new UserNotFoundError(userId);

    const updatedUser = user.updateContactInfo({
      name: input.name,
      email: input.email !== undefined ? Email.create({ value: input.email }) : undefined,
      image: input.image,
      address: input.address,
      phone: input.phone,
    });

    await this.users.update(updatedUser);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email.toString(),
      image: updatedUser.image,
      address: updatedUser.address,
      phone: updatedUser.phone,
      updatedAt: updatedUser.updatedAt,
    };
  }
}
