import { InvalidSubscriptionError } from '../errors/subscription.error';

export enum SubscriptionPlan {
  BASIC = 'BASIC',
  PROFESSIONAL = 'PROFESSIONAL',
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

type SubscriptionProps = {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  status: string;
  plan: SubscriptionPlan;
  priceId: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  lastEventAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type SubscriptionChange = {
  stripeSubscriptionId: string;
  status: string;
  plan: SubscriptionPlan;
  priceId: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  occurredAt: Date;
};

type SubscriptionCreateInput = SubscriptionChange & {
  id: string;
  userId: string;
};

export class SubscriptionEntity {
  private constructor(private readonly props: SubscriptionProps) {
    SubscriptionEntity.validate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get stripeSubscriptionId(): string {
    return this.props.stripeSubscriptionId;
  }

  get status(): string {
    return this.props.status;
  }

  get plan(): SubscriptionPlan {
    return this.props.plan;
  }

  get priceId(): string {
    return this.props.priceId;
  }

  get currentPeriodEnd(): Date | null {
    return this.props.currentPeriodEnd;
  }

  get cancelAtPeriodEnd(): boolean {
    return this.props.cancelAtPeriodEnd;
  }

  get lastEventAt(): Date {
    return this.props.lastEventAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isActive(): boolean {
    return ACTIVE_STATUSES.has(this.status);
  }

  static create({ occurredAt, ...input }: SubscriptionCreateInput): SubscriptionEntity {
    const now = new Date();

    return new SubscriptionEntity({
      ...input,
      lastEventAt: occurredAt,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: SubscriptionProps): SubscriptionEntity {
    return new SubscriptionEntity({ ...props });
  }

  isOutdatedBy(occurredAt: Date): boolean {
    return occurredAt.getTime() > this.lastEventAt.getTime();
  }

  applyChange({ occurredAt, ...change }: SubscriptionChange): SubscriptionEntity {
    return new SubscriptionEntity({
      ...this.props,
      ...change,
      lastEventAt: occurredAt,
      updatedAt: new Date(),
    });
  }

  private static validate(props: SubscriptionProps) {
    if (!props.userId.trim()) throw new InvalidSubscriptionError('userId é obrigatório.');
    if (!props.stripeSubscriptionId.trim())
      throw new InvalidSubscriptionError('stripeSubscriptionId é obrigatório.');
  }
}
