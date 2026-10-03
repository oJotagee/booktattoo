import { JwtAuthGuard, type SessionPayload, TokenPayload } from '@bookink/shared/auth';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { CreateCheckoutSessionUseCase } from '@/application/use-cases/billing/create-checkout-session.use-case';
import { CreatePortalSessionUseCase } from '@/application/use-cases/billing/create-portal-session.use-case';
import { CreateCheckoutSessionRequestDto } from '../dtos/billing/create-checkout-session.request.dto';
import { BillingRedirectResponseDto } from '../dtos/billing/billing-redirect.response.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly createCheckoutSession: CreateCheckoutSessionUseCase,
    private readonly createPortalSession: CreatePortalSessionUseCase,
  ) {}

  @Post('checkout')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: BillingRedirectResponseDto })
  checkout(
    @TokenPayload() payload: SessionPayload,
    @Body() body: CreateCheckoutSessionRequestDto,
  ): Promise<BillingRedirectResponseDto> {
    return this.createCheckoutSession.execute({
      userId: payload.sub,
      email: payload.email,
      plan: body.plan,
    });
  }

  @Post('portal')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: BillingRedirectResponseDto })
  portal(@TokenPayload() payload: SessionPayload): Promise<BillingRedirectResponseDto> {
    return this.createPortalSession.execute({ userId: payload.sub });
  }
}
