import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';

import { InvalidReminderError, ReminderNotFoundError } from '@/domain/errors/reminder.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';

type OutgoingResponse = {
  status(code: number): { json(body: unknown): void };
};

const DOMAIN_ERRORS = [
  InvalidReminderError,
  ReminderNotFoundError,
  ForbiddenResourceAccessError,
] as const;

const STATUS_BY_ERROR = new Map<Function, HttpStatus>([
  [InvalidReminderError, HttpStatus.BAD_REQUEST],

  [ForbiddenResourceAccessError, HttpStatus.FORBIDDEN],

  [ReminderNotFoundError, HttpStatus.NOT_FOUND],
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
