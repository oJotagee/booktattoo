import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDto } from '@bookink/shared/common';

import { BookingRequestStatus, MessageAuthor } from '@/domain/entities/booking-request.entity';
import { BookingOfferStatus } from '@/domain/entities/booking-offer.entity';

export class BookingRequestCreatedResponseDto {
  @ApiProperty({ description: 'Token de acesso à conversa, usado no link /pedido/<token>' })
  token!: string;
}

export class MessageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: MessageAuthor })
  author!: MessageAuthor;

  @ApiProperty()
  body!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class OfferResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: BookingOfferStatus })
  status!: BookingOfferStatus;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  scheduledAt!: Date;

  @ApiProperty({ description: 'Minutos' })
  duration!: number;

  @ApiProperty({ description: 'Centavos' })
  price!: number;

  @ApiProperty({ description: 'Centavos' })
  depositAmount!: number;

  @ApiProperty({ description: 'O cliente está no checkout do sinal agora' })
  paymentInProgress!: boolean;

  @ApiProperty({ description: 'O horário da proposta pendente já passou' })
  expired!: boolean;
}

export class ClientConversationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: BookingRequestStatus })
  status!: BookingRequestStatus;

  @ApiProperty()
  clientName!: string;

  @ApiProperty()
  artistId!: string;

  @ApiProperty()
  artistName!: string;

  @ApiProperty({ nullable: true })
  closedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: [MessageResponseDto] })
  messages!: MessageResponseDto[];

  @ApiProperty({ type: OfferResponseDto, nullable: true })
  offer!: OfferResponseDto | null;
}

export class BookingRequestResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  clientName!: string;

  @ApiProperty()
  clientEmail!: string;

  @ApiProperty({ description: 'Somente dígitos' })
  clientPhone!: string;

  @ApiProperty({ enum: BookingRequestStatus })
  status!: BookingRequestStatus;

  @ApiProperty()
  lastMessageAt!: Date;

  @ApiProperty({ nullable: true })
  closedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;
}

export class BookingRequestListItemResponseDto extends BookingRequestResponseDto {
  @ApiProperty({ type: MessageResponseDto, nullable: true })
  lastMessage!: MessageResponseDto | null;

  @ApiProperty({ description: 'A última mensagem é do cliente e a conversa está aberta' })
  awaitingReply!: boolean;
}

export class BookingRequestListResponseDto {
  @ApiProperty({ type: [BookingRequestListItemResponseDto] })
  list!: BookingRequestListItemResponseDto[];

  @ApiProperty({ type: PaginationResponseDto })
  pagination!: PaginationResponseDto;
}

export class BookingRequestDetailResponseDto extends BookingRequestResponseDto {
  @ApiProperty({ type: [MessageResponseDto] })
  messages!: MessageResponseDto[];

  @ApiProperty({ type: OfferResponseDto, nullable: true })
  offer!: OfferResponseDto | null;
}

export class CheckoutUrlResponseDto {
  @ApiProperty()
  checkoutUrl!: string;
}
