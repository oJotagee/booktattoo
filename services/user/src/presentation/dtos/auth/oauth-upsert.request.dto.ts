import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

const OAUTH_PROVIDERS = ['google', 'github'] as const;

export class OAuthUpsertRequestDto {
  @ApiProperty({ enum: OAUTH_PROVIDERS, example: 'google' })
  @IsIn(OAUTH_PROVIDERS)
  provider!: 'google' | 'github';

  @ApiProperty({ example: '109283746192837465' })
  @IsString()
  providerAccountId!: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Maria Silva', nullable: true })
  @IsOptional()
  @IsString()
  name!: string | null;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/a/...', nullable: true })
  @IsOptional()
  @IsString()
  image!: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  accessToken?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  refreshToken?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsInt()
  expiresAt?: number | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  idToken?: string | null;
}
