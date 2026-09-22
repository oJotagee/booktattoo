import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateServiceInfoRequestDto {
  @ApiProperty({ example: 'Tatuagem Fineline', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 60, description: 'Duração em minutos', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  duration?: number;

  @ApiProperty({ example: 5000, description: 'Valor do sinal em centavos', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  depositAmount?: number;
}
