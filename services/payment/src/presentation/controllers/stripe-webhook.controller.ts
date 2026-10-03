import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';

import { HandleBillingWebhookUseCase } from '@/application/use-cases/billing/handle-billing-webhook.use-case';
import { WebhookReceivedResponseDto } from '../dtos/billing/webhook-received.response.dto';

@ApiExcludeController()
@Controller('webhooks')
export class StripeWebhookController {
  constructor(private readonly handleBillingWebhook: HandleBillingWebhookUseCase) {}

  @Post('billing')
  @HttpCode(200)
  async billing(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<WebhookReceivedResponseDto> {
    if (!signature || !request.rawBody) {
      throw new BadRequestException('Requisição de webhook sem assinatura ou corpo.');
    }

    await this.handleBillingWebhook.execute({ rawBody: request.rawBody, signature });

    return { received: true };
  }
}
