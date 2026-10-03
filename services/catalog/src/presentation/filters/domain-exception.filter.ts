import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';

import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import {
  PlanAccessUnavailableError,
  PlanExpiredError,
  PlanLimitReachedError,
} from '@/domain/errors/plan.error';
import {
  InvalidServiceError,
  ServiceAlreadyInStatusError,
  ServiceNotFoundError,
} from '@/domain/errors/service.error';
import {
  GaleryAlreadyInStatusError,
  GaleryNotFoundError,
  InvalidGaleryError,
  UnsupportedGaleryImageTypeError,
} from '@/domain/errors/galery.error';

type OutgoingResponse = {
  status(code: number): { json(body: unknown): void };
};

const DOMAIN_ERRORS = [
  InvalidServiceError,
  ServiceAlreadyInStatusError,
  ServiceNotFoundError,
  InvalidGaleryError,
  GaleryAlreadyInStatusError,
  GaleryNotFoundError,
  UnsupportedGaleryImageTypeError,
  PlanExpiredError,
  PlanLimitReachedError,
  PlanAccessUnavailableError,
  ForbiddenResourceAccessError,
] as const;

const STATUS_BY_ERROR = new Map<Function, HttpStatus>([
  [InvalidServiceError, HttpStatus.BAD_REQUEST],
  [ServiceAlreadyInStatusError, HttpStatus.BAD_REQUEST],
  [InvalidGaleryError, HttpStatus.BAD_REQUEST],
  [GaleryAlreadyInStatusError, HttpStatus.BAD_REQUEST],
  [UnsupportedGaleryImageTypeError, HttpStatus.BAD_REQUEST],

  [ForbiddenResourceAccessError, HttpStatus.FORBIDDEN],
  [PlanExpiredError, HttpStatus.FORBIDDEN],
  [PlanLimitReachedError, HttpStatus.FORBIDDEN],

  [ServiceNotFoundError, HttpStatus.NOT_FOUND],
  [GaleryNotFoundError, HttpStatus.NOT_FOUND],

  [PlanAccessUnavailableError, HttpStatus.SERVICE_UNAVAILABLE],
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
