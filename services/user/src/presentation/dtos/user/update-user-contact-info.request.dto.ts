import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateUserContactInfoRequestDto {
  @ApiProperty({ example: 'Maria Silva', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  image?: string | null;

  @ApiProperty({ example: 'Rua Exemplo, 123', required: false, nullable: true })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiProperty({ example: '+55 11 90000-0000', required: false, nullable: true })
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiProperty({ example: 'Profissional especializado em...', required: false, nullable: true })
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiProperty({ example: ['08:00', '08:30'], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  times?: string[];
}
