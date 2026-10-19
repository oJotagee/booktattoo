import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { ExternalServiceUnavailableError } from '@/domain/errors/appointment.error';
import servicesConfig from '../config/services.config';
import { requestJson } from './request-json';
import type {
  CreateDepositCheckoutParams,
  DepositCheckout,
  DepositGateway,
  RefundDepositParams,
} from '@/application/port/deposit-gateway.port';

@Injectable()
export class HttpDepositGateway implements DepositGateway {
  private readonly logger = new Logger(HttpDepositGateway.name);

  constructor(
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  async create(params: CreateDepositCheckoutParams): Promise<DepositCheckout> {
    const artistPage = `${this.config.frontendUrl}/${encodeURIComponent(params.artistId)}`;

    const checkout = await this.post<DepositCheckout>('checkout', {
      ...params,
      successUrl: `${artistPage}?booking=success`,
      cancelUrl: `${artistPage}?booking=cancelled`,
    });

    if (!checkout) throw new ExternalServiceUnavailableError();

    return { checkoutSessionId: checkout.checkoutSessionId, url: checkout.url };
  }

  async refund(params: RefundDepositParams): Promise<{ refundId: string }> {
    const refund = await this.post<{ refundId: string }>('refund', params);

    if (!refund) throw new ExternalServiceUnavailableError();

    return { refundId: refund.refundId };
  }

  async expireCheckout(checkoutSessionId: string): Promise<void> {
    await this.post('expire', { checkoutSessionId });
  }

  private post<T>(action: string, data: object): Promise<T | null> {
    if (!this.config.internalApiSecret) {
      this.logger.error(
        'INTERNAL_API_SECRET não configurado; o payment-service vai recusar as chamadas de sinal.',
      );
      throw new ExternalServiceUnavailableError();
    }

    return requestJson<T>(this.logger, {
      method: 'POST',
      url: `${this.config.paymentServiceUrl}/internal/deposits/${action}`,
      headers: { 'X-Internal-Secret': this.config.internalApiSecret },
      data,
    });
  }
}
