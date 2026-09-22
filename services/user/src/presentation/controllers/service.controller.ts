import { FilterDto } from '@bookink/shared/common';
import { Body, Controller, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import type { PayloadSession } from '@/application/port/session-token-issuer.port';
import { CreateServiceUseCase } from '@/application/use-cases/service/create-service.use-case';
import { FindServiceByIdUseCase } from '@/application/use-cases/service/find-service-by-id.use-case';
import { FindServicesByUserUseCase } from '@/application/use-cases/service/find-services-by-user.use-case';
import { UpdateServiceInfoUseCase } from '@/application/use-cases/service/update-service-info.use-case';
import { UpdateServiceStatusUseCase } from '@/application/use-cases/service/update-service-status.use-case';

import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { TokenPayload } from '../decorators/token-payload.decorator';
import { CreateServiceRequestDto } from '../dtos/service/create-service.request.dto';
import {
  ServiceListResponseDto,
  ServiceResponseDto,
  ServiceUpdateStatusResponseDto,
} from '../dtos/service/service.response.dto';
import { UpdateServiceInfoRequestDto } from '../dtos/service/update-service-info.request.dto';
import { UpdateServiceStatusRequestDto } from '../dtos/service/update-service-status.request.dto';

@ApiTags('services')
@Controller('services')
export class ServiceController {
  constructor(
    private readonly createService: CreateServiceUseCase,
    private readonly findServiceById: FindServiceByIdUseCase,
    private readonly findServicesByUser: FindServicesByUserUseCase,
    private readonly updateServiceInfo: UpdateServiceInfoUseCase,
    private readonly updateServiceStatus: UpdateServiceStatusUseCase,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ServiceListResponseDto })
  findMine(
    @TokenPayload() payload: PayloadSession,
    @Query() filter: FilterDto,
  ): Promise<ServiceListResponseDto> {
    return this.findServicesByUser.execute({
      userId: payload.sub,
      limit: filter.limit,
      offset: filter.offset,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ServiceResponseDto })
  findById(@Param('id') id: string): Promise<ServiceResponseDto> {
    return this.findServiceById.execute({ id });
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ServiceResponseDto })
  create(
    @TokenPayload() payload: PayloadSession,
    @Body() body: CreateServiceRequestDto,
  ): Promise<ServiceResponseDto> {
    return this.createService.execute({ userId: payload.sub, ...body });
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ServiceResponseDto })
  update(
    @TokenPayload() payload: PayloadSession,
    @Param('id') id: string,
    @Body() body: UpdateServiceInfoRequestDto,
  ): Promise<ServiceResponseDto> {
    return this.updateServiceInfo.execute({ serviceId: id, userId: payload.sub, ...body });
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ServiceUpdateStatusResponseDto })
  updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateServiceStatusRequestDto,
  ): Promise<ServiceUpdateStatusResponseDto> {
    return this.updateServiceStatus.execute({ serviceId: id, status: body.status });
  }
}
