import { ApiBearerAuth, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto } from '@bookink/shared/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { FindRemindersByUserUseCase } from '@/application/use-cases/reminder/find-reminders-by-user.use-case';
import { FindReminderByIdUseCase } from '@/application/use-cases/reminder/find-reminder-by-id.use-case';
import {
  ReminderListResponseDto,
  ReminderResponseDto,
} from '../dtos/reminder/reminder.response.dto';
import { CreateReminderUseCase } from '@/application/use-cases/reminder/create-reminder.use-case';
import { UpdateReminderUseCase } from '@/application/use-cases/reminder/update-reminder.use-case';
import { DeleteReminderUseCase } from '@/application/use-cases/reminder/delete-reminder.use-case';
import { JwtAuthGuard, type SessionPayload, TokenPayload } from '@bookink/shared/auth';
import { CreateReminderRequestDto } from '../dtos/reminder/create-reminder.request.dto';
import { UpdateReminderRequestDto } from '../dtos/reminder/update-reminder.request.dto';

@ApiTags('reminders')
@Controller('reminders')
export class ReminderController {
  constructor(
    private readonly createReminder: CreateReminderUseCase,
    private readonly findReminderById: FindReminderByIdUseCase,
    private readonly findRemindersByUser: FindRemindersByUserUseCase,
    private readonly updateReminder: UpdateReminderUseCase,
    private readonly deleteReminder: DeleteReminderUseCase,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ReminderListResponseDto })
  findMine(
    @TokenPayload() payload: SessionPayload,
    @Query() filter: FilterDto,
  ): Promise<ReminderListResponseDto> {
    return this.findRemindersByUser.execute({
      userId: payload.sub,
      limit: filter.limit,
      offset: filter.offset,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ReminderResponseDto })
  findById(
    @Param('id') id: string,
    @TokenPayload() payload: SessionPayload,
  ): Promise<ReminderResponseDto> {
    return this.findReminderById.execute({ id, userId: payload.sub });
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ReminderResponseDto })
  create(
    @TokenPayload() payload: SessionPayload,
    @Body() body: CreateReminderRequestDto,
  ): Promise<ReminderResponseDto> {
    return this.createReminder.execute({ userId: payload.sub, ...body });
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ReminderResponseDto })
  update(
    @TokenPayload() payload: SessionPayload,
    @Param('id') id: string,
    @Body() body: UpdateReminderRequestDto,
  ): Promise<ReminderResponseDto> {
    return this.updateReminder.execute({ reminderId: id, userId: payload.sub, ...body });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  remove(@Param('id') id: string, @TokenPayload() payload: SessionPayload): Promise<void> {
    return this.deleteReminder.execute({ id, userId: payload.sub });
  }
}
