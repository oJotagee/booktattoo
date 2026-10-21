import { JwtAuthGuard, type SessionPayload, TokenPayload } from '@bookink/shared/auth';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { FindArtistBookingRequestsUseCase } from '@/application/use-cases/booking-request/find-artist-booking-requests.use-case';
import { FindArtistBookingRequestUseCase } from '@/application/use-cases/booking-request/find-artist-booking-request.use-case';
import { CloseBookingRequestUseCase } from '@/application/use-cases/booking-request/close-booking-request.use-case';
import { SendArtistMessageUseCase } from '@/application/use-cases/booking-request/send-artist-message.use-case';
import { CreateBookingOfferUseCase } from '@/application/use-cases/booking-offer/create-booking-offer.use-case';
import { WithdrawBookingOfferUseCase } from '@/application/use-cases/booking-offer/withdraw-booking-offer.use-case';
import {
  BookingRequestFilterDto,
  CreateBookingOfferRequestDto,
  SendMessageRequestDto,
} from '../dtos/booking-request/booking-request.request.dto';
import {
  BookingRequestDetailResponseDto,
  BookingRequestListResponseDto,
  MessageResponseDto,
  OfferResponseDto,
} from '../dtos/booking-request/booking-request.response.dto';

@ApiTags('booking-requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('booking-requests')
export class BookingRequestController {
  constructor(
    private readonly findArtistBookingRequests: FindArtistBookingRequestsUseCase,
    private readonly findArtistBookingRequest: FindArtistBookingRequestUseCase,
    private readonly sendArtistMessage: SendArtistMessageUseCase,
    private readonly closeBookingRequest: CloseBookingRequestUseCase,
    private readonly createBookingOffer: CreateBookingOfferUseCase,
    private readonly withdrawBookingOffer: WithdrawBookingOfferUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: BookingRequestListResponseDto })
  findMine(
    @TokenPayload() payload: SessionPayload,
    @Query() filter: BookingRequestFilterDto,
  ): Promise<BookingRequestListResponseDto> {
    return this.findArtistBookingRequests.execute({
      userId: payload.sub,
      status: filter.status,
      limit: filter.limit,
      offset: filter.offset,
    });
  }

  @Get(':id')
  @ApiOkResponse({ type: BookingRequestDetailResponseDto })
  findById(
    @Param('id') id: string,
    @TokenPayload() payload: SessionPayload,
  ): Promise<BookingRequestDetailResponseDto> {
    return this.findArtistBookingRequest.execute({ id, userId: payload.sub });
  }

  @Post(':id/messages')
  @ApiCreatedResponse({ type: MessageResponseDto })
  sendMessage(
    @Param('id') id: string,
    @TokenPayload() payload: SessionPayload,
    @Body() body: SendMessageRequestDto,
  ): Promise<MessageResponseDto> {
    return this.sendArtistMessage.execute({ id, userId: payload.sub, body: body.body });
  }

  @Post(':id/offer')
  @ApiCreatedResponse({ type: OfferResponseDto })
  createOffer(
    @Param('id') id: string,
    @TokenPayload() payload: SessionPayload,
    @Body() body: CreateBookingOfferRequestDto,
  ): Promise<OfferResponseDto> {
    return this.createBookingOffer.execute({ id, userId: payload.sub, ...body });
  }

  @Delete(':id/offer')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  withdrawOffer(@Param('id') id: string, @TokenPayload() payload: SessionPayload): Promise<void> {
    return this.withdrawBookingOffer.execute({ id, userId: payload.sub });
  }

  @Patch(':id/close')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  close(@Param('id') id: string, @TokenPayload() payload: SessionPayload): Promise<void> {
    return this.closeBookingRequest.execute({ id, userId: payload.sub });
  }
}
