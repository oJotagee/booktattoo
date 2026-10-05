import { IsOptional, IsString } from 'class-validator';
import { FilterDto } from '@bookink/shared/common';
import { ApiProperty } from '@nestjs/swagger';

export class FilterPublicServicesRequestDto extends FilterDto {
  @ApiProperty({ required: false, description: 'Filtra pelo artista' })
  @IsOptional()
  @IsString({ message: 'Artista inválido' })
  userId?: string;
}
