import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateServiceStatusRequestDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  status!: boolean;
}
