import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  type RawBodyRequest,
  Req,
} from '@nestjs/common';

import { HandleBillingWebhookUseCase } from '@/application/use-cases/billing/handle-billing-webhook.use-case';
import type { WebhookSource } from '@/application/port/billing-gateway.port';
import { WebhookReceivedResponseDto } from '../dtos/billing/webhook-received.response.dto';

@ApiExcludeController()
@Controller('webhooks')
export class StripeWebhookController {
  constructor(private readonly handleBillingWebhook: HandleBillingWebhookUseCase) {}

  @Post('billing')
  @HttpCode(200)
  billing(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<WebhookReceivedResponseDto> {
    return this.receive(request, signature, 'platform');
  }

  @Post('connect')
  @HttpCode(200)
  connect(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<WebhookReceivedResponseDto> {
    return this.receive(request, signature, 'connect');
  }

  private async receive(
    request: RawBodyRequest<Request>,
    signature: string | undefined,
    source: WebhookSource,
  ): Promise<WebhookReceivedResponseDto> {
    if (!signature || !request.rawBody) {
      throw new BadRequestException('Requisição de webhook sem assinatura ou corpo.');
    }

    await this.handleBillingWebhook.execute({ rawBody: request.rawBody, signature, source });

    return { received: true };
  }
}
