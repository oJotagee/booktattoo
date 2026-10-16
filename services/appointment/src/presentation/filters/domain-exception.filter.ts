import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import { MessagingUnavailableError } from '@bookink/shared/events';

import { InvalidReminderError, ReminderNotFoundError } from '@/domain/errors/reminder.error';
import { ForbiddenResourceAccessError } from '@/domain/errors/authorization.error';
import {
  AppointmentAlreadyCancelledError,
  AppointmentNotFoundError,
  ArtistUnavailableError,
  ExternalServiceUnavailableError,
  GaleryUnavailableError,
  InvalidAppointmentError,
  SlotInThePastError,
  SlotUnavailableError,
} from '@/domain/errors/appointment.error';

type OutgoingResponse = {
  status(code: number): { json(body: unknown): void };
};

const DOMAIN_ERRORS = [
  InvalidReminderError,
  ReminderNotFoundError,
  ForbiddenResourceAccessError,
  InvalidAppointmentError,
  AppointmentNotFoundError,
  AppointmentAlreadyCancelledError,
  ArtistUnavailableError,
  GaleryUnavailableError,
  SlotUnavailableError,
  SlotInThePastError,
  ExternalServiceUnavailableError,
  MessagingUnavailableError,
] as const;

const STATUS_BY_ERROR = new Map<Function, HttpStatus>([
  [InvalidReminderError, HttpStatus.BAD_REQUEST],
  [InvalidAppointmentError, HttpStatus.BAD_REQUEST],
  [SlotInThePastError, HttpStatus.BAD_REQUEST],

  [ForbiddenResourceAccessError, HttpStatus.FORBIDDEN],

  [ReminderNotFoundError, HttpStatus.NOT_FOUND],
  [AppointmentNotFoundError, HttpStatus.NOT_FOUND],

  [AppointmentAlreadyCancelledError, HttpStatus.CONFLICT],
  [ArtistUnavailableError, HttpStatus.CONFLICT],
  [GaleryUnavailableError, HttpStatus.CONFLICT],
  [SlotUnavailableError, HttpStatus.CONFLICT],

  [ExternalServiceUnavailableError, HttpStatus.SERVICE_UNAVAILABLE],
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
