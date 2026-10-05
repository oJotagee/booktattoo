import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReminderRequestDto {
  @ApiProperty({ example: 'Comprar agulhas 5RL' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
