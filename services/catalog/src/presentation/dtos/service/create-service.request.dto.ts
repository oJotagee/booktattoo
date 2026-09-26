import { IsInt, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceRequestDto {
  @ApiProperty({ example: 'Tatuagem Fineline' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 60, description: 'Duração em minutos' })
  @IsInt()
  @IsPositive()
  duration!: number;

  @ApiProperty({ example: 5000, description: 'Valor do sinal em centavos' })
  @IsInt()
  @IsPositive()
  depositAmount!: number;
}
