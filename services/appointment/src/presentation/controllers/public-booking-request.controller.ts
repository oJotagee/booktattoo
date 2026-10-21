import { ApiCreatedResponse, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Headers, Post } from '@nestjs/common';

import { FindClientConversationUseCase } from '@/application/use-cases/booking-request/find-client-conversation.use-case';
import { CreateBookingRequestUseCase } from '@/application/use-cases/booking-request/create-booking-request.use-case';
import { SendClientMessageUseCase } from '@/application/use-cases/booking-request/send-client-message.use-case';
import { PayBookingOfferUseCase } from '@/application/use-cases/booking-offer/pay-booking-offer.use-case';
import {
  CreateBookingRequestRequestDto,
  SendMessageRequestDto,
} from '../dtos/booking-request/booking-request.request.dto';
import {
  BookingRequestCreatedResponseDto,
  CheckoutUrlResponseDto,
  ClientConversationResponseDto,
  MessageResponseDto,
} from '../dtos/booking-request/booking-request.response.dto';

const TOKEN_HEADER = 'x-booking-token';

@ApiTags('public')
@Controller('public/booking-requests')
export class PublicBookingRequestController {
  constructor(
    private readonly createBookingRequest: CreateBookingRequestUseCase,
    private readonly findClientConversation: FindClientConversationUseCase,
    private readonly sendClientMessage: SendClientMessageUseCase,
    private readonly payBookingOffer: PayBookingOfferUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: BookingRequestCreatedResponseDto })
  create(@Body() body: CreateBookingRequestRequestDto): Promise<BookingRequestCreatedResponseDto> {
    return this.createBookingRequest.execute(body);
  }

  @Get('conversation')
  @ApiHeader({ name: TOKEN_HEADER, required: true })
  @ApiOkResponse({ type: ClientConversationResponseDto })
  conversation(@Headers(TOKEN_HEADER) token = ''): Promise<ClientConversationResponseDto> {
    return this.findClientConversation.execute({ token });
  }

  @Post('conversation/messages')
  @ApiHeader({ name: TOKEN_HEADER, required: true })
  @ApiCreatedResponse({ type: MessageResponseDto })
  sendMessage(
    @Headers(TOKEN_HEADER) token = '',
    @Body() body: SendMessageRequestDto,
  ): Promise<MessageResponseDto> {
    return this.sendClientMessage.execute({ token, body: body.body });
  }

  @Post('conversation/offer/pay')
  @ApiHeader({ name: TOKEN_HEADER, required: true })
  @ApiCreatedResponse({ type: CheckoutUrlResponseDto })
  payOffer(@Headers(TOKEN_HEADER) token = ''): Promise<CheckoutUrlResponseDto> {
    return this.payBookingOffer.execute({ token });
  }
}
