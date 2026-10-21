import {
  BookingRequestClosedError,
  InvalidBookingRequestError,
} from '../errors/booking-request.error';

export enum BookingRequestStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum MessageAuthor {
  ARTIST = 'ARTIST',
  CLIENT = 'CLIENT',
  SYSTEM = 'SYSTEM',
}

export const MESSAGE_MAX_LENGTH = 2000;

type BookingRequestProps = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  status: BookingRequestStatus;
  lastMessageAt: Date;
  closedAt: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type BookingRequestCreateInput = Pick<
  BookingRequestProps,
  'id' | 'clientName' | 'clientEmail' | 'clientPhone' | 'userId'
>;

export class BookingRequestEntity {
  private constructor(private readonly props: BookingRequestProps) {
    BookingRequestEntity.validate(props);
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

  get status(): BookingRequestStatus {
    return this.props.status;
  }

  get isOpen(): boolean {
    return this.props.status === BookingRequestStatus.OPEN;
  }

  get lastMessageAt(): Date {
    return this.props.lastMessageAt;
  }

  get closedAt(): Date | null {
    return this.props.closedAt;
  }

  get userId(): string {
    return this.props.userId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  static create(input: BookingRequestCreateInput): BookingRequestEntity {
    const now = new Date();

    return new BookingRequestEntity({
      ...input,
      clientName: input.clientName.trim(),
      clientEmail: input.clientEmail.trim().toLowerCase(),
      clientPhone: input.clientPhone.replace(/\D/g, ''),
      status: BookingRequestStatus.OPEN,
      lastMessageAt: now,
      closedAt: null,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: BookingRequestProps): BookingRequestEntity {
    return new BookingRequestEntity({ ...props });
  }

  receiveMessage(message: BookingRequestMessageEntity): BookingRequestEntity {
    if (!this.isOpen && message.author !== MessageAuthor.SYSTEM) {
      throw new BookingRequestClosedError();
    }

    return new BookingRequestEntity({
      ...this.props,
      lastMessageAt: message.createdAt,
      updatedAt: new Date(),
    });
  }

  close(): BookingRequestEntity {
    if (!this.isOpen) throw new BookingRequestClosedError();

    const now = new Date();

    return new BookingRequestEntity({
      ...this.props,
      status: BookingRequestStatus.CLOSED,
      closedAt: now,
      updatedAt: now,
    });
  }

  private static validate(props: BookingRequestProps) {
    if (!props.id.trim()) throw new InvalidBookingRequestError('Conversa sem identificador.');
    if (!props.clientName.trim()) throw new InvalidBookingRequestError('O nome é obrigatório.');
    if (!props.clientEmail.trim()) throw new InvalidBookingRequestError('O e-mail é obrigatório.');
    if (props.clientPhone.length < 10) {
      throw new InvalidBookingRequestError('O telefone é obrigatório.');
    }
  }
}

type BookingRequestMessageProps = {
  id: string;
  bookingRequestId: string;
  author: MessageAuthor;
  body: string;
  createdAt: Date;
};

export class BookingRequestMessageEntity {
  private constructor(private readonly props: BookingRequestMessageProps) {
    BookingRequestMessageEntity.validate(props);
  }

  get id(): string {
    return this.props.id;
  }

  get bookingRequestId(): string {
    return this.props.bookingRequestId;
  }

  get author(): MessageAuthor {
    return this.props.author;
  }

  get body(): string {
    return this.props.body;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  static create(input: Omit<BookingRequestMessageProps, 'createdAt'>): BookingRequestMessageEntity {
    return new BookingRequestMessageEntity({
      ...input,
      body: input.body.trim(),
      createdAt: new Date(),
    });
  }

  static system(bookingRequestId: string, body: string): BookingRequestMessageEntity {
    return BookingRequestMessageEntity.create({
      id: crypto.randomUUID(),
      bookingRequestId,
      author: MessageAuthor.SYSTEM,
      body,
    });
  }

  static restore(props: BookingRequestMessageProps): BookingRequestMessageEntity {
    return new BookingRequestMessageEntity({ ...props });
  }

  private static validate(props: BookingRequestMessageProps) {
    if (!props.body.trim()) throw new InvalidBookingRequestError('A mensagem não pode ser vazia.');
    if (props.body.length > MESSAGE_MAX_LENGTH) {
      throw new InvalidBookingRequestError(
        `A mensagem pode ter no máximo ${MESSAGE_MAX_LENGTH} caracteres.`,
      );
    }
  }
}
