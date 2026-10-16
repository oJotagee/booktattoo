import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, type SessionPayload, TokenPayload } from '@bookink/shared/auth';
import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';

import { FindDayAppointmentsUseCase } from '@/application/use-cases/appointment/find-day-appointments.use-case';
import { GetAppointmentStatsUseCase } from '@/application/use-cases/appointment/get-appointment-stats.use-case';
import { CancelAppointmentUseCase } from '@/application/use-cases/appointment/cancel-appointment.use-case';
import { DateQueryDto } from '../dtos/appointment/appointment.request.dto';
import {
  AppointmentStatsResponseDto,
  DayAppointmentResponseDto,
} from '../dtos/appointment/appointment.response.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentController {
  constructor(
    private readonly findDayAppointments: FindDayAppointmentsUseCase,
    private readonly getAppointmentStats: GetAppointmentStatsUseCase,
    private readonly cancelAppointment: CancelAppointmentUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: [DayAppointmentResponseDto] })
  findByDay(
    @TokenPayload() payload: SessionPayload,
    @Query() query: DateQueryDto,
  ): Promise<DayAppointmentResponseDto[]> {
    return this.findDayAppointments.execute({ userId: payload.sub, date: query.date });
  }

  @Get('stats')
  @ApiOkResponse({ type: AppointmentStatsResponseDto })
  stats(@TokenPayload() payload: SessionPayload): Promise<AppointmentStatsResponseDto> {
    return this.getAppointmentStats.execute({ userId: payload.sub });
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  cancel(@Param('id') id: string, @TokenPayload() payload: SessionPayload): Promise<void> {
    return this.cancelAppointment.execute({ id, userId: payload.sub });
  }
}
