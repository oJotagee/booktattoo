import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import { ExternalServiceUnavailableError } from '@/domain/errors/appointment.error';
import servicesConfig from '../config/services.config';
import { requestJson } from './request-json';
import type {
  CreateDepositCheckoutParams,
  DepositCheckout,
  DepositCheckoutGateway,
} from '@/application/port/deposit-checkout-gateway.port';

@Injectable()
export class HttpDepositCheckoutGateway implements DepositCheckoutGateway {
  private readonly logger = new Logger(HttpDepositCheckoutGateway.name);

  constructor(
    @Inject(servicesConfig.KEY)
    private readonly config: ConfigType<typeof servicesConfig>,
  ) {}

  async create(params: CreateDepositCheckoutParams): Promise<DepositCheckout> {
    if (!this.config.internalApiSecret) {
      this.logger.error(
        'INTERNAL_API_SECRET não configurado; o payment-service vai recusar o checkout do sinal.',
      );
      throw new ExternalServiceUnavailableError();
    }

    const url = `${this.config.paymentServiceUrl}/internal/deposits/checkout`;
    const artistPage = `${this.config.frontendUrl}/${encodeURIComponent(params.artistId)}`;

    const checkout = await requestJson<DepositCheckout>(this.logger, {
      method: 'POST',
      url,
      headers: { 'X-Internal-Secret': this.config.internalApiSecret },
      data: {
        ...params,
        successUrl: `${artistPage}?booking=success`,
        cancelUrl: `${artistPage}?booking=cancelled`,
      },
    });

    if (!checkout) throw new ExternalServiceUnavailableError();

    return { checkoutSessionId: checkout.checkoutSessionId, url: checkout.url };
  }
}
