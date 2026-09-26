import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FilterDto } from '@bookink/shared/common';

import { FindPublicArtistsUseCase } from '@/application/use-cases/artist/find-public-artists.use-case';
import { PublicArtistListResponseDto } from '../dtos/artist/public-artist.response.dto';

@ApiTags('public')
@Controller('public/artists')
export class PublicArtistController {
  constructor(private readonly findPublicArtists: FindPublicArtistsUseCase) {}

  @Get()
  @ApiOkResponse({ type: PublicArtistListResponseDto })
  findAll(@Query() filter: FilterDto): Promise<PublicArtistListResponseDto> {
    return this.findPublicArtists.execute({ limit: filter.limit, offset: filter.offset });
  }
}
