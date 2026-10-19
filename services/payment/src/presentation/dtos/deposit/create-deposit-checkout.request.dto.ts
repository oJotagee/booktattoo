import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepositCheckoutRequestDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  @IsString()
  @IsNotEmpty()
  appointmentId!: string;

  @ApiProperty({ example: 'user-1', description: 'Tatuador que recebe o sinal' })
  @IsString()
  @IsNotEmpty()
  artistId!: string;

  @ApiProperty({ example: 8000, description: 'Valor do sinal em centavos' })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiProperty({ example: 'Rosa Tradicional' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'https://bucket/gallery/rosa.png', nullable: true, type: String })
  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl!: string | null;

  @ApiProperty({ example: 'cliente@email.com' })
  @IsEmail()
  customerEmail!: string;

  @ApiProperty({ example: 'http://localhost:3000/user-1?booking=success' })
  @IsUrl({ require_tld: false })
  successUrl!: string;

  @ApiProperty({ example: 'http://localhost:3000/user-1?booking=cancelled' })
  @IsUrl({ require_tld: false })
  cancelUrl!: string;
}
