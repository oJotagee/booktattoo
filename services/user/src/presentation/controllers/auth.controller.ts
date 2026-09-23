import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RefreshedSessionResponseDto, SessionResponseDto } from '../dtos/auth/session.response.dto';
import { ForgotPasswordUseCase } from '@/application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '@/application/use-cases/auth/reset-password.use-case';
import { RefreshTokenUseCase } from '@/application/use-cases/auth/refresh-token.use-case';
import { RegisterUserUseCase } from '@/application/use-cases/auth/register-user.use-case';
import { OAuthUpsertUseCase } from '@/application/use-cases/auth/oauth-upsert.use-case';
import { ForgotPasswordRequestDto } from '../dtos/auth/forgot-password.request.dto';
import { ResetPasswordRequestDto } from '../dtos/auth/reset-password.request.dto';
import { RefreshTokenRequestDto } from '../dtos/auth/refresh-token.request.dto';
import { RegisterUserRequestDto } from '../dtos/auth/register-user.request.dto';
import { OAuthUpsertRequestDto } from '../dtos/auth/oauth-upsert.request.dto';
import { LoginUseCase } from '@/application/use-cases/auth/login.use-case';
import { UserLoginResponseDto } from '../dtos/user/user.response.dto';
import { LoginRequestDto } from '../dtos/auth/login.request.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly login: LoginUseCase,
    private readonly oauthUpsert: OAuthUpsertUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
    private readonly forgotPassword: ForgotPasswordUseCase,
    private readonly resetPassword: ResetPasswordUseCase,
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

  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  requestPasswordReset(@Body() body: ForgotPasswordRequestDto): Promise<void> {
    return this.forgotPassword.execute(body);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPasswordWithToken(@Body() body: ResetPasswordRequestDto): Promise<void> {
    return this.resetPassword.execute(body);
  }
}
