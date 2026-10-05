import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { FindPublicServicesUseCase } from '@/application/use-cases/service/find-public-services.use-case';
import { FilterPublicServicesRequestDto } from '../dtos/service/filter-public-services.request.dto';
import { PublicServiceListResponseDto } from '../dtos/service/public-service.response.dto';

@ApiTags('public')
@Controller('public/services')
export class PublicServiceController {
  constructor(private readonly findPublicServices: FindPublicServicesUseCase) {}

  @Get()
  @ApiOkResponse({ type: PublicServiceListResponseDto })
  findAll(@Query() filter: FilterPublicServicesRequestDto): Promise<PublicServiceListResponseDto> {
    return this.findPublicServices.execute({
      limit: filter.limit,
      offset: filter.offset,
      ...(filter.userId && { userId: filter.userId }),
    });
  }
}
