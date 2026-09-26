import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';

import {
  InvalidServiceError,
  ServiceAlreadyInStatusError,
  ServiceNotFoundError,
} from '@/domain/errors/service.error';

type OutgoingResponse = {
  status(code: number): { json(body: unknown): void };
};

const DOMAIN_ERRORS = [
  InvalidServiceError,
  ServiceAlreadyInStatusError,
  ServiceNotFoundError,
] as const;

const STATUS_BY_ERROR = new Map<Function, HttpStatus>([
  [InvalidServiceError, HttpStatus.BAD_REQUEST],
  [ServiceAlreadyInStatusError, HttpStatus.BAD_REQUEST],

  [ServiceNotFoundError, HttpStatus.NOT_FOUND],
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
