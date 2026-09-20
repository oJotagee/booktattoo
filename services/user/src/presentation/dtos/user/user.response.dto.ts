import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  email!: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/a/...', nullable: true })
  image!: string | null;

  @ApiProperty({ example: 'Rua Exemplo, 123', nullable: true })
  address!: string | null;

  @ApiProperty({ example: '+55 11 90000-0000', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'Profissional especializado em...', nullable: true })
  bio!: string | null;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ example: ['08:00', '08:30'] })
  times!: string[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class UserLoginResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  email!: string;

  @ApiProperty()
  createdAt!: Date;
}

export class UserInfoResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'Maria Silva' })
  name!: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/a/...', nullable: true })
  image!: string | null;

  @ApiProperty({ example: 'Rua Exemplo, 123', nullable: true })
  address!: string | null;

  @ApiProperty({ example: '+55 11 90000-0000', nullable: true })
  phone!: string | null;

  @ApiProperty({ example: 'Profissional especializado em...', nullable: true })
  bio!: string | null;

  @ApiProperty({ example: ['08:00', '08:30'] })
  times!: string[];

  @ApiProperty({ example: '2024-06-01T12:00:00Z' })
  updatedAt!: Date;
}

export class UserUpdateStatusResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiProperty({ example: '2024-06-01T12:00:00Z' })
  updatedAt!: Date;
}

export class UserUpdateAvatarResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-4a1b-8c9d-1234567890ab' })
  id!: string;

  @ApiProperty({ example: 'https://bookink-assets.s3.us-east-2.amazonaws.com/avatars/...' })
  image!: string;

  @ApiProperty({ example: '2024-06-01T12:00:00Z' })
  updatedAt!: Date;
}
