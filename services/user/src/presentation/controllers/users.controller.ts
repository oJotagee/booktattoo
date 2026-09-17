import { Body, Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { PayloadSession } from '@/application/port/session-token-issuer.port';
import { FindUserByIdUseCase } from '@/application/use-cases/find-user-by-id.use-case';
import { LoginUseCase } from '@/application/use-cases/login.use-case';
import { OAuthUpsertUseCase } from '@/application/use-cases/oauth-upsert.use-case';
import { RefreshTokenUseCase } from '@/application/use-cases/refresh-token.use-case';
import { RegisterUserUseCase } from '@/application/use-cases/register-user.use-case';
import { UpdateUserContactInfoUseCase } from '@/application/use-cases/update-user-contact-info.use-case';
import { UpdateUserStatusUseCase } from '@/application/use-cases/update-user-status.use-case';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { TokenPayload } from '../decorators/token-payload.decorator';
import { LoginRequestDto } from '../dtos/auth/login.request.dto';
import { OAuthUpsertRequestDto } from '../dtos/auth/oauth-upsert.request.dto';
import { RefreshTokenRequestDto } from '../dtos/auth/refresh-token.request.dto';
import { RegisterUserRequestDto } from '../dtos/auth/register-user.request.dto';
import { RefreshedSessionResponseDto, SessionResponseDto } from '../dtos/auth/session.response.dto';
import { UpdateUserContactInfoRequestDto } from '../dtos/user/update-user-contact-info.request.dto';
import { UpdateUserStatusRequestDto } from '../dtos/user/update-user-status.request.dto';
import {
  UserInfoResponse,
  UserLoginResponseDto,
  UserResponseDto,
  UserUpdateStatusResponse,
} from '../dtos/user/user.response.dto';

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
    private readonly updateUserStatus: UpdateUserStatusUseCase,
  ) { }

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

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserResponseDto })
  me(@TokenPayload() payload: PayloadSession): Promise<UserResponseDto> {
    return this.findUserById.execute({ id: payload.sub });
  }

  @Put('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserInfoResponse })
  updateMe(
    @TokenPayload() payload: PayloadSession,
    @Body() body: UpdateUserContactInfoRequestDto,
  ): Promise<UserInfoResponse> {
    return this.updateUserContactInfo.execute({ userId: payload.sub, ...body });
  }

  @Patch('me/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserUpdateStatusResponse })
  updateMyStatus(
    @TokenPayload() payload: PayloadSession,
    @Body() body: UpdateUserStatusRequestDto,
  ): Promise<UserUpdateStatusResponse> {
    return this.updateUserStatus.execute({ userId: payload.sub, status: body.status });
  }
}
