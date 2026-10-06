import { CACHE_PORT, type CachePort } from '@bookink/shared/cache';
import { Inject, Injectable } from '@nestjs/common';

import { UserEntity, UserStatus } from '@/domain/entities/user.entity';
import type { PasswordHasher } from '../../port/password-hasher.port';
import type { UserRepository } from '../../port/user-repository.port';
import { UserAlreadyExistsError } from '@/domain/errors/user.error';
import { PASSWORD_HASHER } from '../../port/password-hasher.port';
import { USER_REPOSITORY } from '../../port/user-repository.port';
import { Email } from '@/domain/value-objects/email.vo';
import { PUBLIC_ARTISTS_CACHE } from '@/application/cache/public-cache';

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
    @Inject(CACHE_PORT) private readonly cache: CachePort,
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
      bio: null,
      role: null,
      status: UserStatus.ACTIVE,
      times: [],
      password: passwordHash,
    });

    await this.users.create(user);
    await this.cache.invalidate(PUBLIC_ARTISTS_CACHE);

    return {
      id: user.id,
      name: user.name,
      email: user.email.toString(),
      createdAt: user.createdAt,
    };
  }
}
