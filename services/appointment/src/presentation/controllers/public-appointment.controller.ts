import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CreatePublicAppointmentUseCase } from '@/application/use-cases/appointment/create-public-appointment.use-case';
import { FindBlockedTimesUseCase } from '@/application/use-cases/appointment/find-blocked-times.use-case';
import {
  BlockedTimesQueryDto,
  CreatePublicAppointmentRequestDto,
} from '../dtos/appointment/appointment.request.dto';
import {
  BlockedTimesResponseDto,
  PublicAppointmentCreatedResponseDto,
} from '../dtos/appointment/appointment.response.dto';

@ApiTags('public')
@Controller('public/appointments')
export class PublicAppointmentController {
  constructor(
    private readonly createPublicAppointment: CreatePublicAppointmentUseCase,
    private readonly findBlockedTimes: FindBlockedTimesUseCase,
  ) {}

  @Get('blocked-times')
  @ApiOkResponse({ type: BlockedTimesResponseDto })
  async blockedTimes(@Query() query: BlockedTimesQueryDto): Promise<BlockedTimesResponseDto> {
    const blockedTimes = await this.findBlockedTimes.execute({
      artistId: query.artistId,
      date: query.date,
    });

    return { blockedTimes };
  }

  @Post()
  @ApiCreatedResponse({ type: PublicAppointmentCreatedResponseDto })
  create(
    @Body() body: CreatePublicAppointmentRequestDto,
  ): Promise<PublicAppointmentCreatedResponseDto> {
    return this.createPublicAppointment.execute(body);
  }
}
