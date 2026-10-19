import { JwtAuthGuard, type SessionPayload, TokenPayload } from '@bookink/shared/auth';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';

import { CreateConnectLoginLinkUseCase } from '@/application/use-cases/connect/create-connect-login-link.use-case';
import { StartConnectOnboardingUseCase } from '@/application/use-cases/connect/start-connect-onboarding.use-case';
import { GetConnectStatusUseCase } from '@/application/use-cases/connect/get-connect-status.use-case';
import { BillingRedirectResponseDto } from '../dtos/billing/billing-redirect.response.dto';
import { ConnectStatusResponseDto } from '../dtos/connect/connect-status.response.dto';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing/connect')
export class ConnectController {
  constructor(
    private readonly getConnectStatus: GetConnectStatusUseCase,
    private readonly startConnectOnboarding: StartConnectOnboardingUseCase,
    private readonly createConnectLoginLink: CreateConnectLoginLinkUseCase,
  ) {}

  @Get()
  @ApiOkResponse({ type: ConnectStatusResponseDto })
  status(@TokenPayload() payload: SessionPayload): Promise<ConnectStatusResponseDto> {
    return this.getConnectStatus.execute({ userId: payload.sub });
  }

  @Post('onboarding')
  @HttpCode(200)
  @ApiOkResponse({ type: BillingRedirectResponseDto })
  onboarding(@TokenPayload() payload: SessionPayload): Promise<BillingRedirectResponseDto> {
    return this.startConnectOnboarding.execute({ userId: payload.sub, email: payload.email });
  }

  @Post('dashboard')
  @HttpCode(200)
  @ApiOkResponse({ type: BillingRedirectResponseDto })
  dashboard(@TokenPayload() payload: SessionPayload): Promise<BillingRedirectResponseDto> {
    return this.createConnectLoginLink.execute({ userId: payload.sub });
  }
}
