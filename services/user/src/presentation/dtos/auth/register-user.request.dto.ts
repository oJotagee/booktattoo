import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class RegisterUserRequestDto {
  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'maria@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha-forte-123' })
  @IsString()
  @MinLength(8)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos',
    },
  )
  password!: string;
}
