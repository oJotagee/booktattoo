import { PaginationResponseDto } from '@bookink/shared/common';
import { ApiProperty } from '@nestjs/swagger';

export class PublicArtistResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({ example: 'https://bucket/avatars/user-1/file.png', nullable: true })
  image!: string | null;

  @ApiProperty({ example: 'Tatuador há 10 anos, especialista em fineline.', nullable: true })
  bio!: string | null;

  @ApiProperty({ example: 'Fineline', nullable: true, description: 'Estilo do artista' })
  role!: string | null;

  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'VACATION'] })
  status!: string;

  @ApiProperty({ example: ['09:00', '10:00'] })
  times!: string[];
}

export class PublicArtistListResponseDto {
  @ApiProperty({ description: 'Lista de artistas', type: [PublicArtistResponseDto] })
  list!: PublicArtistResponseDto[];

  @ApiProperty({ description: 'Detalhes da paginação', type: PaginationResponseDto })
  pagination!: PaginationResponseDto;
}
