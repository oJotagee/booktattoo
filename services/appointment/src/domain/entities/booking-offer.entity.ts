import {
  BookingOfferUnavailableError,
  InvalidBookingOfferError,
} from '../errors/booking-request.error';
import { SLOT_MINUTES } from '../schedule';

export enum BookingOfferStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  WITHDRAWN = 'WITHDRAWN',
  CANCELLED = 'CANCELLED',
}

export const OFFER_MAX_DURATION = 480;
export const OFFER_MIN_DEPOSIT = 50;
export const OFFER_TITLE_MAX_LENGTH = 120;

type BookingOfferProps = {
  id: string;
  bookingRequestId: string;
  title: string;
  scheduledAt: Date;
  duration: number;
  price: number;
  depositAmount: number;
  status: BookingOfferStatus;
  appointmentId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type BookingOfferCreateInput = Pick<
  BookingOfferProps,
  'id' | 'bookingRequestId' | 'title' | 'scheduledAt' | 'duration' | 'price' | 'depositAmount'
>;

export class BookingOfferEntity {
  private constructor(private readonly props: BookingOfferProps) {
    BookingOfferEntity.validate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get bookingRequestId(): string {
    return this.props.bookingRequestId;
  }

  get title(): string {
    return this.props.title;
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

  get status(): BookingOfferStatus {
    return this.props.status;
  }

  get isPending(): boolean {
    return this.props.status === BookingOfferStatus.PENDING;
  }

  get appointmentId(): string | null {
    return this.props.appointmentId;
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

  static create(input: BookingOfferCreateInput): BookingOfferEntity {
    const now = new Date();

    return new BookingOfferEntity({
      ...input,
      title: input.title.trim(),
      status: BookingOfferStatus.PENDING,
      appointmentId: null,
      paidAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: BookingOfferProps): BookingOfferEntity {
    return new BookingOfferEntity({ ...props });
  }

  withdraw(): BookingOfferEntity {
    if (!this.isPending) throw new BookingOfferUnavailableError();

    return new BookingOfferEntity({
      ...this.props,
      status: BookingOfferStatus.WITHDRAWN,
      updatedAt: new Date(),
    });
  }

  markPaid(appointmentId: string, paidAt: Date): BookingOfferEntity {
    if (!this.isPending) throw new BookingOfferUnavailableError();

    return new BookingOfferEntity({
      ...this.props,
      status: BookingOfferStatus.PAID,
      appointmentId,
      paidAt,
      updatedAt: new Date(),
    });
  }

  markCancelled(): BookingOfferEntity {
    if (this.props.status !== BookingOfferStatus.PAID) throw new BookingOfferUnavailableError();

    return new BookingOfferEntity({
      ...this.props,
      status: BookingOfferStatus.CANCELLED,
      updatedAt: new Date(),
    });
  }

  private static validate(props: BookingOfferProps) {
    if (!props.id.trim()) throw new InvalidBookingOfferError('Proposta sem identificador.');
    if (!props.title.trim()) throw new InvalidBookingOfferError('Informe um título.');
    if (props.title.length > OFFER_TITLE_MAX_LENGTH) {
      throw new InvalidBookingOfferError(
        `O título pode ter no máximo ${OFFER_TITLE_MAX_LENGTH} caracteres.`,
      );
    }
    if (
      !Number.isInteger(props.duration) ||
      props.duration < SLOT_MINUTES ||
      props.duration > OFFER_MAX_DURATION ||
      props.duration % SLOT_MINUTES !== 0
    ) {
      throw new InvalidBookingOfferError(
        `A duração deve ser em blocos de ${SLOT_MINUTES} minutos, até ${OFFER_MAX_DURATION / 60} horas.`,
      );
    }
    if (!Number.isInteger(props.price) || !Number.isInteger(props.depositAmount)) {
      throw new InvalidBookingOfferError('Valores devem estar em centavos.');
    }
    if (props.depositAmount < OFFER_MIN_DEPOSIT) {
      throw new InvalidBookingOfferError('O sinal deve ser de pelo menos R$ 0,50.');
    }
    if (props.depositAmount > props.price) {
      throw new InvalidBookingOfferError('O sinal não pode ser maior que o valor total.');
    }
  }
}
