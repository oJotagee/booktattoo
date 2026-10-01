import { PaginationResponseDto } from '@bookink/shared/common';
import { ApiProperty } from '@nestjs/swagger';

import { GaleryStyle } from '@/domain/entities/galery.entity';

export class GaleryResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'Rosa fineline' })
  title!: string;

  @ApiProperty({ example: 'https://bookink-assets.s3.us-east-2.amazonaws.com/gallery/...' })
  imageUrl!: string;

  @ApiProperty({ example: '10x15cm' })
  size!: string;

  @ApiProperty({ example: 35000 })
  price!: number;

  @ApiProperty({ enum: GaleryStyle, example: GaleryStyle.FINELINE })
  style!: GaleryStyle;

  @ApiProperty({ example: true })
  available!: boolean;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  userId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  serviceId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class GaleryListResponseDto {
  @ApiProperty({ description: 'Lista de itens da galeria', type: [GaleryResponseDto] })
  list!: GaleryResponseDto[];

  @ApiProperty({ description: 'Detalhes da paginação', type: PaginationResponseDto })
  pagination!: PaginationResponseDto;
}

export class GaleryUpdateImageResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'https://bookink-assets.s3.us-east-2.amazonaws.com/gallery/...' })
  imageUrl!: string;

  @ApiProperty({ example: '2024-06-01T12:00:00Z' })
  updatedAt!: Date;
}

export class GaleryUpdateAvailabilityResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: true })
  available!: boolean;

  @ApiProperty({ example: '2024-06-01T12:00:00Z' })
  updatedAt!: Date;
}
