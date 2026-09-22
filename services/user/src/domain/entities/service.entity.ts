import { InvalidServiceError, ServiceAlreadyInStatusError } from '../errors/service.error';

type ServiceProps = {
  id: string;
  name: string;
  duration: number;
  depositAmount: number;
  status: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ServiceCreateInput = {
  id: string;
  name: string;
  duration: number;
  depositAmount: number;
  userId: string;
};

type UpdateServiceInfoInput = {
  name?: string;
  duration?: number;
  depositAmount?: number;
};

type ServiceRestoreInput = {
  id: string;
  name: string;
  duration: number;
  depositAmount: number;
  status: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ServiceEntity {
  private constructor(private readonly serviceProps: ServiceProps) {
    ServiceEntity.validate(serviceProps);
  }

  get id(): string {
    return this.serviceProps.id;
  }

  get name(): string {
    return this.serviceProps.name;
  }

  get duration(): number {
    return this.serviceProps.duration;
  }

  get depositAmount(): number {
    return this.serviceProps.depositAmount;
  }

  get status(): boolean {
    return this.serviceProps.status;
  }

  get createdAt(): Date {
    return this.serviceProps.createdAt;
  }

  get userId(): string {
    return this.serviceProps.userId;
  }

  get updatedAt(): Date {
    return this.serviceProps.updatedAt;
  }

  static create(input: ServiceCreateInput): ServiceEntity {
    const now = new Date();

    const service = new ServiceEntity({
      id: input.id,
      name: input.name,
      duration: input.duration,
      depositAmount: input.depositAmount,
      status: true,
      userId: input.userId,
      createdAt: now,
      updatedAt: now,
    });

    return service;
  }

  static restore(input: ServiceRestoreInput): ServiceEntity {
    return new ServiceEntity({ ...input });
  }

  updateInfo(input: UpdateServiceInfoInput): ServiceEntity {
    return new ServiceEntity({
      ...this.serviceProps,
      name: input.name ?? this.name,
      duration: input.duration ?? this.duration,
      depositAmount: input.depositAmount ?? this.depositAmount,
      updatedAt: new Date(),
    });
  }

  activate(): ServiceEntity {
    if (this.status === true) throw new ServiceAlreadyInStatusError(this.status);

    return new ServiceEntity({
      ...this.serviceProps,
      status: true,
      updatedAt: new Date(),
    });
  }

  deactivate(): ServiceEntity {
    if (this.status === false) throw new ServiceAlreadyInStatusError(this.status);

    return new ServiceEntity({
      ...this.serviceProps,
      status: false,
      updatedAt: new Date(),
    });
  }

  toSafeJSON(): ServiceProps {
    return {
      id: this.id,
      name: this.name,
      duration: this.duration,
      depositAmount: this.depositAmount,
      status: this.status,
      createdAt: this.createdAt,
      userId: this.userId,
      updatedAt: this.updatedAt,
    };
  }

  private static validate(props: ServiceProps) {
    if (!props.id.trim()) throw new InvalidServiceError('Service not found.');
    if (!props.name.trim()) throw new InvalidServiceError('Service name cannot be empty.');
  }
}
