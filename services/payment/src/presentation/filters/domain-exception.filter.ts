import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { MessagingUnavailableError } from '@bookink/shared/events';
import { INTERNAL_ERROR_MESSAGE } from '@bookink/shared/http';

import {
  BillingCustomerNotFoundError,
  InvalidBillingCustomerError,
  InvalidWebhookSignatureError,
  NoActiveSubscriptionError,
  PlanAlreadyActiveError,
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
  NoActiveSubscriptionError,
  PlanAlreadyActiveError,
  SubscriptionAlreadyActiveError,
  UnknownPriceError,
  MessagingUnavailableError,
] as const;

const STATUS_BY_ERROR = new Map<Function, HttpStatus>([
  [InvalidBillingCustomerError, HttpStatus.BAD_REQUEST],
  [InvalidWebhookSignatureError, HttpStatus.BAD_REQUEST],

  [BillingCustomerNotFoundError, HttpStatus.NOT_FOUND],

  [SubscriptionAlreadyActiveError, HttpStatus.CONFLICT],
  [NoActiveSubscriptionError, HttpStatus.CONFLICT],
  [PlanAlreadyActiveError, HttpStatus.CONFLICT],

  [UnknownPriceError, HttpStatus.INTERNAL_SERVER_ERROR],

  [MessagingUnavailableError, HttpStatus.SERVICE_UNAVAILABLE],
]);

@Catch(...DOMAIN_ERRORS)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const status = STATUS_BY_ERROR.get(exception.constructor) ?? HttpStatus.BAD_REQUEST;
    const isServerError = status >= HttpStatus.INTERNAL_SERVER_ERROR;

    if (isServerError) this.logger.error(exception.stack ?? exception.message);

    const response = host.switchToHttp().getResponse<OutgoingResponse>();

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: isServerError ? INTERNAL_ERROR_MESSAGE : exception.message,
    });
  }
}
