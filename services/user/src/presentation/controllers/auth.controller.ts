import { Body, Controller, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { LoginUseCase } from '@/application/use-cases/auth/login.use-case';
import { OAuthUpsertUseCase } from '@/application/use-cases/auth/oauth-upsert.use-case';
import { RefreshTokenUseCase } from '@/application/use-cases/auth/refresh-token.use-case';
import { RegisterUserUseCase } from '@/application/use-cases/auth/register-user.use-case';
import { LoginRequestDto } from '../dtos/auth/login.request.dto';
import { OAuthUpsertRequestDto } from '../dtos/auth/oauth-upsert.request.dto';
import { RefreshTokenRequestDto } from '../dtos/auth/refresh-token.request.dto';
import { RegisterUserRequestDto } from '../dtos/auth/register-user.request.dto';
import { RefreshedSessionResponseDto, SessionResponseDto } from '../dtos/auth/session.response.dto';
import { UserLoginResponseDto } from '../dtos/user/user.response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly login: LoginUseCase,
    private readonly oauthUpsert: OAuthUpsertUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
  ) {}

  @Post('register')
  @ApiOkResponse({ type: UserLoginResponseDto })
  register(@Body() body: RegisterUserRequestDto): Promise<UserLoginResponseDto> {
    return this.registerUser.execute(body);
  }

  @Post('login')
  @ApiOkResponse({ type: SessionResponseDto })
  signIn(@Body() body: LoginRequestDto): Promise<SessionResponseDto> {
    return this.login.execute(body);
  }

  @Post('oauth/upsert')
  @ApiOkResponse({ type: SessionResponseDto })
  upsertOAuthAccount(@Body() body: OAuthUpsertRequestDto): Promise<SessionResponseDto> {
    return this.oauthUpsert.execute(body);
  }

  @Post('refresh-token')
  @ApiOkResponse({ type: RefreshedSessionResponseDto })
  refresh(@Body() body: RefreshTokenRequestDto): Promise<RefreshedSessionResponseDto> {
    return this.refreshToken.execute(body);
  }
}
