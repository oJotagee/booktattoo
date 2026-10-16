import { ApiProperty } from '@nestjs/swagger';

export class GaleryStatsResponseDto {
  @ApiProperty({ example: 12 })
  total!: number;

  @ApiProperty({ example: 9 })
  available!: number;
}
