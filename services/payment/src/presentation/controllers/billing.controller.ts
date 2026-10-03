import { JwtAuthGuard, type SessionPayload, TokenPayload } from '@bookink/shared/auth';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';

import { CreateCheckoutSessionUseCase } from '@/application/use-cases/billing/create-checkout-session.use-case';
import { CreatePortalSessionUseCase } from '@/application/use-cases/billing/create-portal-session.use-case';
import { ChangePlanUseCase } from '@/application/use-cases/billing/change-plan.use-case';
import { ChangePlanResponseDto } from '../dtos/billing/change-plan.response.dto';
import { SelectPlanRequestDto } from '../dtos/billing/select-plan.request.dto';
import { BillingRedirectResponseDto } from '../dtos/billing/billing-redirect.response.dto';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(
    private readonly createCheckoutSession: CreateCheckoutSessionUseCase,
    private readonly createPortalSession: CreatePortalSessionUseCase,
    private readonly changePlan: ChangePlanUseCase,
  ) {}

  @Post('checkout')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: BillingRedirectResponseDto })
  checkout(
    @TokenPayload() payload: SessionPayload,
    @Body() body: SelectPlanRequestDto,
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

  @Post('change-plan')
  @HttpCode(200)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: ChangePlanResponseDto })
  changeMyPlan(
    @TokenPayload() payload: SessionPayload,
    @Body() body: SelectPlanRequestDto,
  ): Promise<ChangePlanResponseDto> {
    return this.changePlan.execute({ userId: payload.sub, plan: body.plan });
  }
}
