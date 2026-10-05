import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { FindPublicGaleriesUseCase } from '@/application/use-cases/galery/find-public-galeries.use-case';
import { FilterPublicGaleriesRequestDto } from '../dtos/galery/filter-public-galeries.request.dto';
import { PublicGaleryListResponseDto } from '../dtos/galery/public-galery.response.dto';

@ApiTags('public')
@Controller('public/galeries')
export class PublicGaleryController {
  constructor(private readonly findPublicGaleries: FindPublicGaleriesUseCase) {}

  @Get()
  @ApiOkResponse({ type: PublicGaleryListResponseDto })
  findAll(@Query() filter: FilterPublicGaleriesRequestDto): Promise<PublicGaleryListResponseDto> {
    return this.findPublicGaleries.execute({
      limit: filter.limit,
      offset: filter.offset,
      ...(filter.userId && { userId: filter.userId }),
      ...(filter.style && { style: filter.style }),
    });
  }
}
