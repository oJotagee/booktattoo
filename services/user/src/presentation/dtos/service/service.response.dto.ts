import { PaginationResponseDto } from '@bookink/shared/common';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'Tatuagem Fineline' })
  name!: string;

  @ApiProperty({ example: 60 })
  duration!: number;

  @ApiProperty({ example: 5000 })
  depositAmount!: number;

  @ApiProperty({ example: true })
  status!: boolean;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  userId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ServiceListResponseDto {
  @ApiProperty({ description: 'Lista de serviços', type: [ServiceResponseDto] })
  list!: ServiceResponseDto[];

  @ApiProperty({ description: 'Detalhes da paginação', type: PaginationResponseDto })
  pagination!: PaginationResponseDto;
}

export class ServiceUpdateStatusResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: true })
  status!: boolean;

  @ApiProperty({ example: '2024-06-01T12:00:00Z' })
  updatedAt!: Date;
}
