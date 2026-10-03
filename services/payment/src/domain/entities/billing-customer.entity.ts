import { InvalidBillingCustomerError } from '../errors/billing.error';

type BillingCustomerProps = {
  userId: string;
  stripeCustomerId: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

type BillingCustomerCreateInput = {
  userId: string;
  stripeCustomerId: string;
  email: string;
};

export class BillingCustomerEntity {
  private constructor(private readonly props: BillingCustomerProps) {
    BillingCustomerEntity.validate(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get stripeCustomerId(): string {
    return this.props.stripeCustomerId;
  }

  get email(): string {
    return this.props.email;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: BillingCustomerCreateInput): BillingCustomerEntity {
    const now = new Date();

    return new BillingCustomerEntity({ ...input, createdAt: now, updatedAt: now });
  }

  static restore(props: BillingCustomerProps): BillingCustomerEntity {
    return new BillingCustomerEntity({ ...props });
  }

  private static validate(props: BillingCustomerProps) {
    if (!props.userId.trim()) throw new InvalidBillingCustomerError('userId é obrigatório.');
    if (!props.stripeCustomerId.trim())
      throw new InvalidBillingCustomerError('stripeCustomerId é obrigatório.');
  }
}
