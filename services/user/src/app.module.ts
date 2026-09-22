import { StorageModule } from '@bookink/shared/storage';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ACCOUNT_REPOSITORY } from '@/application/port/account-repository.port';
import { PASSWORD_HASHER } from '@/application/port/password-hasher.port';
import { REFRESH_TOKEN_REPOSITORY } from '@/application/port/refresh-token-repository.port';
import { SESSION_TOKEN_ISSUER } from '@/application/port/session-token-issuer.port';
import { TOKEN_GENERATOR } from '@/application/port/token-generator.port';
import { USER_REPOSITORY } from '@/application/port/user-repository.port';
import { LoginUseCase } from '@/application/use-cases/auth/login.use-case';
import { OAuthUpsertUseCase } from '@/application/use-cases/auth/oauth-upsert.use-case';
import { RefreshTokenUseCase } from '@/application/use-cases/auth/refresh-token.use-case';
import { RegisterUserUseCase } from '@/application/use-cases/auth/register-user.use-case';
import { FindUserByIdUseCase } from '@/application/use-cases/user/find-user-by-id.use-case';
import { UpdateUserAvatarUseCase } from '@/application/use-cases/user/update-user-avatar.use-case';
import { UpdateUserContactInfoUseCase } from '@/application/use-cases/user/update-user-contact-info.use-case';
import { UpdateUserStatusUseCase } from '@/application/use-cases/user/update-user-status.use-case';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';
import { JwtSessionTokenIssuer } from './infrastructure/auth/jwt-session-token-issuer';
import jwtConfig from './infrastructure/config/jwt.config';
import { BcryptPasswordHasher } from './infrastructure/crypto/bcrypt-password-hasher';
import { NodeTokenGenerator } from './infrastructure/crypto/node-token-generator';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { PrismaAccountRepository } from './infrastructure/repository/prisma-account.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/repository/prisma-refresh-token.repository';
import { PrismaUserRepository } from './infrastructure/repository/prisma-user.repository';
import { AuthController } from './presentation/controllers/auth.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [jwtConfig] }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    StorageModule,
  ],
  controllers: [AuthController, UserController, HealthController],
  providers: [
    PrismaService,
    JwtAuthGuard,
    RegisterUserUseCase,
    LoginUseCase,
    OAuthUpsertUseCase,
    RefreshTokenUseCase,
    FindUserByIdUseCase,
    UpdateUserContactInfoUseCase,
    UpdateUserStatusUseCase,
    UpdateUserAvatarUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: ACCOUNT_REPOSITORY,
      useClass: PrismaAccountRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_GENERATOR,
      useClass: NodeTokenGenerator,
    },
    {
      provide: SESSION_TOKEN_ISSUER,
      useClass: JwtSessionTokenIssuer,
    },
  ],
})
export class AppModule {}
