import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { FindUserByIdUseCase } from '@/application/use-cases/find-user-by-id.use-case';
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token.use-case';
import { RegisterUserUseCase } from '@/application/use-cases/register-user.use-case';
import { OAuthUpsertUseCase } from '@/application/use-cases/oauth-upsert.use-case';
import { UpdateUserContactInfoUseCase } from '@/application/use-cases/update-user-contact-info.use-case';
import { LoginUseCase } from '@/application/use-cases/login.use-case';

import { RefreshedSessionResponseDto, SessionResponseDto } from '../dtos/session.response.dto';
import { TokenPayload } from '../decorators/token-payload.decorator';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { RefreshTokenRequestDto } from '../dtos/refresh-token.request.dto';
import { RegisterUserRequestDto } from '../dtos/register-user.request.dto';
import { OAuthUpsertRequestDto } from '../dtos/oauth-upsert.request.dto';
import { UpdateUserContactInfoRequestDto } from '../dtos/update-user-contact-info.request.dto';
import { LoginRequestDto } from '../dtos/login.request.dto';
import { UserResponseDto } from '../dtos/user.response.dto';
import type { SessionClaims } from '@/application/port/session-token-issuer.port';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly login: LoginUseCase,
    private readonly oauthUpsert: OAuthUpsertUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly findUserById: FindUserByIdUseCase,
    private readonly updateUserContactInfo: UpdateUserContactInfoUseCase,
  ) { }

  @Post('register')
  register(@Body() body: RegisterUserRequestDto): Promise<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  }> {
    return this.registerUser.execute(body);
  }

  @Post('login')
  signIn(@Body() body: LoginRequestDto): Promise<SessionResponseDto> {
    return this.login.execute(body);
  }

  @Post('oauth/upsert')
  upsertOAuthAccount(@Body() body: OAuthUpsertRequestDto): Promise<SessionResponseDto> {
    return this.oauthUpsert.execute(body);
  }

  @Post('refresh-token')
  refresh(@Body() body: RefreshTokenRequestDto): Promise<RefreshedSessionResponseDto> {
    return this.refreshToken.execute(body);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@TokenPayload() payload: SessionClaims): Promise<UserResponseDto> {
    return this.findUserById.execute({ id: payload.sub });
  }

  @Put('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateMe(
    @TokenPayload() payload: SessionClaims,
    @Body() body: UpdateUserContactInfoRequestDto,
  ): Promise<{
    id: string;
    name: string;
    email: string;
    image: string | null;
    address: string | null;
    phone: string | null;
    updatedAt: Date;
  }> {
    // identidade vem do token, nunca do body — impossível editar o perfil de outro usuário
    return this.updateUserContactInfo.execute({ userId: payload.sub, ...body });
  }
}
