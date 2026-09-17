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

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
