import { InvalidUserError, UserAlreadyInStatusError } from '../errors/user.error';
import type { Email } from '../value-objects/email.vo';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  VACATION = 'VACATION',
}

type UserProps = {
  id: string;
  name: string;
  email: Email;
  emailVerified: Date | null;
  image: string | null;
  passwordHash: string | null;
  address: string | null;
  phone: string | null;
  status: UserStatus;
  times: string[];
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type UserCreateInput = {
  id: string;
  name: string;
  email: Email;
  emailVerified?: Date | null;
  image: string | null;
  address: string | null;
  phone: string | null;
  status: UserStatus;
  times: string[];
  stripeCustomerId: string | null;
  password?: string | null;
};

type UpdateContactInfoInput = {
  name?: string;
  image?: string | null;
  address?: string | null;
  phone?: string | null;
};

type UserRestoreInput = {
  id: string;
  name: string;
  email: Email;
  emailVerified: Date | null;
  image: string | null;
  passwordHash: string | null;
  address: string | null;
  phone: string | null;
  status: UserStatus;
  times: string[];
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UserEntity {
  private constructor(private readonly userProps: UserProps) {
    UserEntity.validate(userProps);
  }

  get id(): string {
    return this.userProps.id;
  }

  get name(): string {
    return this.userProps.name;
  }

  get email(): Email {
    return this.userProps.email;
  }

  get emailVerified(): Date | null {
    return this.userProps.emailVerified;
  }

  get image(): string | null {
    return this.userProps.image;
  }

  get passwordHash(): string | null {
    return this.userProps.passwordHash;
  }

  get address(): string | null {
    return this.userProps.address;
  }

  get phone(): string | null {
    return this.userProps.phone;
  }

  get status(): UserStatus {
    return this.userProps.status;
  }

  get times(): string[] {
    return this.userProps.times;
  }

  get stripeCustomerId(): string | null {
    return this.userProps.stripeCustomerId;
  }

  get createdAt(): Date {
    return this.userProps.createdAt;
  }

  get updatedAt(): Date {
    return this.userProps.updatedAt;
  }

  static create(input: UserCreateInput): UserEntity {
    const now = new Date();

    const user = new UserEntity({
      id: input.id,
      name: input.name,
      email: input.email,
      emailVerified: input.emailVerified ?? null,
      image: input.image ?? null,
      passwordHash: input.password ?? null,
      address: input.address ?? null,
      phone: input.phone ?? null,
      status: input.status,
      times: input.times,
      stripeCustomerId: input.stripeCustomerId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return user;
  }

  static restore(input: UserRestoreInput): UserEntity {
    return new UserEntity({ ...input });
  }

  updateContactInfo(input: UpdateContactInfoInput): UserEntity {
    return new UserEntity({
      ...this.userProps,
      name: input.name ?? this.name,
      image: input.image ?? this.image,
      address: input.address ?? this.address,
      phone: input.phone ?? this.phone,
      updatedAt: new Date(),
    });
  }

  activate(): UserEntity {
    if (this.status === UserStatus.ACTIVE) throw new UserAlreadyInStatusError(this.status);

    return new UserEntity({ ...this.userProps, status: UserStatus.ACTIVE, updatedAt: new Date() });
  }

  deactivate(): UserEntity {
    if (this.status === UserStatus.INACTIVE) throw new UserAlreadyInStatusError(this.status);

    return new UserEntity({
      ...this.userProps,
      status: UserStatus.INACTIVE,
      updatedAt: new Date(),
    });
  }

  setOnVacation(): UserEntity {
    if (this.status === UserStatus.VACATION) throw new UserAlreadyInStatusError(this.status);

    return new UserEntity({
      ...this.userProps,
      status: UserStatus.VACATION,
      updatedAt: new Date(),
    });
  }

  toSafeJSON(): Omit<UserProps, 'email' | 'passwordHash'> & { email: string } {
    return {
      id: this.id,
      name: this.name,
      email: this.email.toString(),
      emailVerified: this.emailVerified,
      image: this.image,
      address: this.address,
      phone: this.phone,
      status: this.status,
      times: this.times,
      stripeCustomerId: this.stripeCustomerId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  private static validate(props: UserProps) {
    if (!props.id.trim()) throw new InvalidUserError('User not found.');
    if (!props.name.trim()) throw new InvalidUserError('User name cannot be empty.');
  }
}
