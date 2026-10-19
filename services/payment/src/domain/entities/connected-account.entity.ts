import { InvalidConnectedAccountError } from '../errors/billing.error';

export type ConnectedAccountStatus = {
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
};

type ConnectedAccountProps = ConnectedAccountStatus & {
  userId: string;
  stripeAccountId: string;
  createdAt: Date;
  updatedAt: Date;
};

type ConnectedAccountCreateInput = {
  userId: string;
  stripeAccountId: string;
};

export class ConnectedAccountEntity {
  private constructor(private readonly props: ConnectedAccountProps) {
    ConnectedAccountEntity.validate(props);
  }

  get userId(): string {
    return this.props.userId;
  }

  get stripeAccountId(): string {
    return this.props.stripeAccountId;
  }

  get chargesEnabled(): boolean {
    return this.props.chargesEnabled;
  }

  get payoutsEnabled(): boolean {
    return this.props.payoutsEnabled;
  }

  get detailsSubmitted(): boolean {
    return this.props.detailsSubmitted;
  }

  get paymentsEnabled(): boolean {
    return this.props.chargesEnabled && this.props.payoutsEnabled;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: ConnectedAccountCreateInput): ConnectedAccountEntity {
    const now = new Date();

    return new ConnectedAccountEntity({
      ...input,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: ConnectedAccountProps): ConnectedAccountEntity {
    return new ConnectedAccountEntity({ ...props });
  }

  hasStatus(status: ConnectedAccountStatus): boolean {
    return (
      this.props.chargesEnabled === status.chargesEnabled &&
      this.props.payoutsEnabled === status.payoutsEnabled &&
      this.props.detailsSubmitted === status.detailsSubmitted
    );
  }

  withStatus(status: ConnectedAccountStatus): ConnectedAccountEntity {
    return new ConnectedAccountEntity({ ...this.props, ...status, updatedAt: new Date() });
  }

  private static validate(props: ConnectedAccountProps) {
    if (!props.userId.trim()) throw new InvalidConnectedAccountError('userId é obrigatório.');
    if (!props.stripeAccountId.trim())
      throw new InvalidConnectedAccountError('stripeAccountId é obrigatório.');
  }
}
