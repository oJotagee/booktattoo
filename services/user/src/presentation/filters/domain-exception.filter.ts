import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';

import { AccountAlreadyLinkedError, InvalidAccountError } from '@/domain/errors/account.error';
import { InvalidEmailError } from '@/domain/errors/email.error';
import {
  InvalidPasswordResetTokenError,
  PasswordResetTokenExpiredError,
  PasswordResetTokenNotFoundError,
  PasswordResetTokenUsedError,
} from '@/domain/errors/password-reset-token.error';
import {
  InvalidRefreshTokenError,
  RefreshTokenExpiredError,
  RefreshTokenNotFoundError,
  RefreshTokenRevokedError,
} from '@/domain/errors/refresh-token.error';
import {
  InvalidServiceError,
  ServiceAlreadyInStatusError,
  ServiceNotFoundError,
} from '@/domain/errors/service.error';
import {
  InvalidCredentialsError,
  InvalidUserError,
  UnsupportedAvatarTypeError,
  UserAlreadyExistsError,
  UserAlreadyInStatusError,
  UserNotFoundError,
} from '@/domain/errors/user.error';

type OutgoingResponse = {
  status(code: number): { json(body: unknown): void };
};

const DOMAIN_ERRORS = [
  InvalidUserError,
  InvalidEmailError,
  InvalidAccountError,
  InvalidRefreshTokenError,
  UserAlreadyInStatusError,
  InvalidCredentialsError,
  RefreshTokenExpiredError,
  RefreshTokenRevokedError,
  UserNotFoundError,
  RefreshTokenNotFoundError,
  UserAlreadyExistsError,
  AccountAlreadyLinkedError,
  UnsupportedAvatarTypeError,
  InvalidServiceError,
  ServiceAlreadyInStatusError,
  ServiceNotFoundError,
  InvalidPasswordResetTokenError,
  PasswordResetTokenExpiredError,
  PasswordResetTokenNotFoundError,
  PasswordResetTokenUsedError,
] as const;

const STATUS_BY_ERROR = new Map<Function, HttpStatus>([
  [InvalidUserError, HttpStatus.BAD_REQUEST],
  [InvalidEmailError, HttpStatus.BAD_REQUEST],
  [InvalidAccountError, HttpStatus.BAD_REQUEST],
  [InvalidRefreshTokenError, HttpStatus.BAD_REQUEST],
  [UserAlreadyInStatusError, HttpStatus.BAD_REQUEST],
  [UnsupportedAvatarTypeError, HttpStatus.BAD_REQUEST],
  [InvalidServiceError, HttpStatus.BAD_REQUEST],
  [ServiceAlreadyInStatusError, HttpStatus.BAD_REQUEST],
  [InvalidPasswordResetTokenError, HttpStatus.BAD_REQUEST],

  [InvalidCredentialsError, HttpStatus.UNAUTHORIZED],
  [RefreshTokenExpiredError, HttpStatus.UNAUTHORIZED],
  [RefreshTokenRevokedError, HttpStatus.UNAUTHORIZED],
  [PasswordResetTokenExpiredError, HttpStatus.UNAUTHORIZED],
  [PasswordResetTokenUsedError, HttpStatus.UNAUTHORIZED],

  [UserNotFoundError, HttpStatus.NOT_FOUND],
  [RefreshTokenNotFoundError, HttpStatus.NOT_FOUND],
  [ServiceNotFoundError, HttpStatus.NOT_FOUND],
  [PasswordResetTokenNotFoundError, HttpStatus.NOT_FOUND],

  [UserAlreadyExistsError, HttpStatus.CONFLICT],
  [AccountAlreadyLinkedError, HttpStatus.CONFLICT],
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
