import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

import { FindUserByIdUseCase } from '@/application/use-cases/user/find-user-by-id.use-case';
import { InternalApiSecretGuard } from '../guards/internal-api-secret.guard';

type ArtistContactResponse = {
  name: string;
  email: string;
};

@ApiExcludeController()
@UseGuards(InternalApiSecretGuard)
@Controller('internal/artists')
export class InternalArtistController {
  constructor(private readonly findUserById: FindUserByIdUseCase) {}

  @Get(':id/contact')
  async contact(@Param('id') id: string): Promise<ArtistContactResponse> {
    const { name, email } = await this.findUserById.execute({ id });

    return { name, email };
  }
}
