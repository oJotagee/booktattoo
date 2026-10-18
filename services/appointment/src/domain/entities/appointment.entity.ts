import {
  AppointmentAlreadyCancelledError,
  InvalidAppointmentError,
} from '../errors/appointment.error';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export const ACTIVE_APPOINTMENT_STATUSES = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED];

type AppointmentProps = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  scheduledAt: Date;
  duration: number;
  price: number;
  depositAmount: number;
  status: AppointmentStatus;
  userId: string;
  serviceId: string | null;
  galeryId: string | null;
  galeryTitle: string | null;
  galeryImageUrl: string | null;
  checkoutSessionId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type AppointmentCreateInput = Omit<
  AppointmentProps,
  'status' | 'checkoutSessionId' | 'paidAt' | 'createdAt' | 'updatedAt'
>;

export class AppointmentEntity {
  private constructor(private readonly props: AppointmentProps) {
    AppointmentEntity.validate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clientName(): string {
    return this.props.clientName;
  }

  get clientEmail(): string {
    return this.props.clientEmail;
  }

  get clientPhone(): string {
    return this.props.clientPhone;
  }

  get scheduledAt(): Date {
    return this.props.scheduledAt;
  }

  get duration(): number {
    return this.props.duration;
  }

  get price(): number {
    return this.props.price;
  }

  get depositAmount(): number {
    return this.props.depositAmount;
  }

  get status(): AppointmentStatus {
    return this.props.status;
  }

  get userId(): string {
    return this.props.userId;
  }

  get serviceId(): string | null {
    return this.props.serviceId;
  }

  get galeryId(): string | null {
    return this.props.galeryId;
  }

  get galeryTitle(): string | null {
    return this.props.galeryTitle;
  }

  get galeryImageUrl(): string | null {
    return this.props.galeryImageUrl;
  }

  get checkoutSessionId(): string | null {
    return this.props.checkoutSessionId;
  }

  get paidAt(): Date | null {
    return this.props.paidAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isPending(): boolean {
    return this.props.status === AppointmentStatus.PENDING;
  }

  static create(input: AppointmentCreateInput): AppointmentEntity {
    const now = new Date();

    return new AppointmentEntity({
      ...input,
      clientName: input.clientName.trim(),
      clientEmail: input.clientEmail.trim().toLowerCase(),
      clientPhone: input.clientPhone.replace(/\D/g, ''),
      status: AppointmentStatus.PENDING,
      checkoutSessionId: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: AppointmentProps): AppointmentEntity {
    return new AppointmentEntity({ ...props });
  }

  attachCheckout(checkoutSessionId: string): AppointmentEntity {
    return new AppointmentEntity({ ...this.props, checkoutSessionId, updatedAt: new Date() });
  }

  confirmPayment(paidAt: Date): AppointmentEntity {
    return new AppointmentEntity({
      ...this.props,
      status: AppointmentStatus.CONFIRMED,
      paidAt,
      updatedAt: new Date(),
    });
  }

  cancel(): AppointmentEntity {
    if (this.props.status === AppointmentStatus.CANCELLED) {
      throw new AppointmentAlreadyCancelledError();
    }

    return new AppointmentEntity({
      ...this.props,
      status: AppointmentStatus.CANCELLED,
      updatedAt: new Date(),
    });
  }

  toSafeJSON(): AppointmentProps {
    return { ...this.props };
  }

  private static validate(props: AppointmentProps) {
    if (!props.id.trim()) throw new InvalidAppointmentError('Agendamento sem identificador.');
    if (!props.clientName.trim()) throw new InvalidAppointmentError('O nome é obrigatório.');
    if (!props.clientEmail.trim()) throw new InvalidAppointmentError('O e-mail é obrigatório.');
    if (!props.clientPhone.trim()) throw new InvalidAppointmentError('O telefone é obrigatório.');
    if (props.duration <= 0) throw new InvalidAppointmentError('Duração inválida.');
    if (props.price < 0 || props.depositAmount < 0) {
      throw new InvalidAppointmentError('Valores do agendamento inválidos.');
    }
    if (props.depositAmount > props.price) {
      throw new InvalidAppointmentError('O sinal não pode ser maior que o valor total.');
    }
  }
}
