import { ApiProperty } from '@nestjs/swagger';

class SessionUserDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  email!: string;

  @ApiProperty({
    example: 'https://booktattoo-assets.s3.us-east-2.amazonaws.com/avatars/...',
    nullable: true,
  })
  image!: string | null;
}

export class SessionResponseDto {
  @ApiProperty({ description: 'JWT de curta duração usado nas requisições autenticadas.' })
  accessToken!: string;

  @ApiProperty({ description: 'Token opaco de longa duração, usado só em /auth/refresh-token.' })
  refreshToken!: string;

  @ApiProperty({ type: SessionUserDto })
  user!: SessionUserDto;
}

export class RefreshedSessionResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;
}
