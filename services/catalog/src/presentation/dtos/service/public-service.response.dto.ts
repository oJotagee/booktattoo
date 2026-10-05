import { PaginationResponseDto } from '@bookink/shared/common';
import { ApiProperty } from '@nestjs/swagger';

export class PublicServiceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'Tatuagem Fineline' })
  name!: string;

  @ApiProperty({ example: 60 })
  duration!: number;

  @ApiProperty({ example: 5000 })
  depositAmount!: number;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  userId!: string;
}

export class PublicServiceListResponseDto {
  @ApiProperty({ description: 'Lista de serviços', type: [PublicServiceResponseDto] })
  list!: PublicServiceResponseDto[];

  @ApiProperty({ description: 'Detalhes da paginação', type: PaginationResponseDto })
  pagination!: PaginationResponseDto;
}
