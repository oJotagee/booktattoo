import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateGaleryAvailabilityRequestDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  available!: boolean;
}
