import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto } from '@bookink/shared/common';

import { FindPublicArtistByIdUseCase } from '@/application/use-cases/artist/find-public-artist-by-id.use-case';
import { FindPublicArtistsUseCase } from '@/application/use-cases/artist/find-public-artists.use-case';
import {
  PublicArtistListResponseDto,
  PublicArtistResponseDto,
} from '../dtos/artist/public-artist.response.dto';

@ApiTags('public')
@Controller('public/artists')
export class PublicArtistController {
  constructor(
    private readonly findPublicArtists: FindPublicArtistsUseCase,
    private readonly findPublicArtistById: FindPublicArtistByIdUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: PublicArtistListResponseDto })
  findAll(@Query() filter: FilterDto): Promise<PublicArtistListResponseDto> {
    return this.findPublicArtists.execute({ limit: filter.limit, offset: filter.offset });
  }

  @Get(':id')
  @ApiOkResponse({ type: PublicArtistResponseDto })
  findById(@Param('id') id: string): Promise<PublicArtistResponseDto> {
    return this.findPublicArtistById.execute({ id });
  }
}
