import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MessagingUnavailableError } from '@bookink/shared/events';

import {
  BillingCustomerNotFoundError,
  InvalidBillingCustomerError,
  InvalidWebhookSignatureError,
  SubscriptionAlreadyActiveError,
  UnknownPriceError,
} from '@/domain/errors/billing.error';

type OutgoingResponse = {
  status(code: number): { json(body: unknown): void };
};

const DOMAIN_ERRORS = [
  InvalidBillingCustomerError,
  InvalidWebhookSignatureError,
  BillingCustomerNotFoundError,
  SubscriptionAlreadyActiveError,
  UnknownPriceError,
  MessagingUnavailableError,
] as const;

const STATUS_BY_ERROR = new Map<Function, HttpStatus>([
  [InvalidBillingCustomerError, HttpStatus.BAD_REQUEST],
  [InvalidWebhookSignatureError, HttpStatus.BAD_REQUEST],

  [BillingCustomerNotFoundError, HttpStatus.NOT_FOUND],

  [SubscriptionAlreadyActiveError, HttpStatus.CONFLICT],

  [UnknownPriceError, HttpStatus.INTERNAL_SERVER_ERROR],

  [MessagingUnavailableError, HttpStatus.SERVICE_UNAVAILABLE],
]);

@Catch(...DOMAIN_ERRORS)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const status = STATUS_BY_ERROR.get(exception.constructor) ?? HttpStatus.BAD_REQUEST;

    const response = host.switchToHttp().getResponse<OutgoingResponse>();

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
