import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReminderRequestDto {
  @ApiProperty({ example: 'Comprar agulhas 3RL' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
