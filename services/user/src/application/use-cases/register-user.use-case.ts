import { Inject, Injectable } from '@nestjs/common';

import { UserEntity, UserStatus } from '@/domain/entities/user.entity';
import { UserAlreadyExistsError } from '@/domain/errors/user.error';
import { Email } from '@/domain/value-objects/email.vo';

import type { PasswordHasher } from '../port/password-hasher.port';
import { PASSWORD_HASHER } from '../port/password-hasher.port';
import type { UserRepository } from '../port/user-repository.port';
import { USER_REPOSITORY } from '../port/user-repository.port';

type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

type RegisterUserOutput = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute({ name, email, password }: RegisterUserInput): Promise<RegisterUserOutput> {
    const emailVo = Email.create({ value: email });

    const existingUser = await this.users.findByEmail(emailVo.value);
    if (existingUser) throw new UserAlreadyExistsError(emailVo.value);

    const passwordHash = await this.passwordHasher.hash(password);

    const user = UserEntity.create({
      id: crypto.randomUUID(),
      name,
      email: emailVo,
      image: null,
      address: null,
      phone: null,
      status: UserStatus.ACTIVE,
      times: [],
      stripeCustomerId: null,
      password: passwordHash,
    });

    await this.users.create(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email.toString(),
      createdAt: user.createdAt,
    };
  }
}
