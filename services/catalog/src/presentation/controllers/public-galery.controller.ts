import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { FindPublicGaleryByIdUseCase } from '@/application/use-cases/galery/find-public-galery-by-id.use-case';
import { FindPublicGaleriesUseCase } from '@/application/use-cases/galery/find-public-galeries.use-case';
import { FilterPublicGaleriesRequestDto } from '../dtos/galery/filter-public-galeries.request.dto';
import {
  PublicGaleryDetailResponseDto,
  PublicGaleryListResponseDto,
} from '../dtos/galery/public-galery.response.dto';

@ApiTags('public')
@Controller('public/galeries')
export class PublicGaleryController {
  constructor(
    private readonly findPublicGaleries: FindPublicGaleriesUseCase,
    private readonly findPublicGaleryById: FindPublicGaleryByIdUseCase,
  ) {}

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

  @Get(':id')
  @ApiOkResponse({ type: PublicGaleryDetailResponseDto })
  findById(@Param('id') id: string): Promise<PublicGaleryDetailResponseDto> {
    return this.findPublicGaleryById.execute({ id });
  }
}
