import { describe, expect, it, mock } from 'bun:test';

import { createAxiosError } from '../support/mocks';

mock.module('axios', () => ({
  isAxiosError: (error: unknown) => Boolean((error as { isAxiosError?: boolean })?.isAxiosError),
}));

const { getApiErrorMessage } = await import('@/lib/api-error');

const FALLBACK = 'Não foi possível concluir a ação.';

describe('getApiErrorMessage', () => {
  it('returns the domain message for 4xx responses', () => {
    const error = createAxiosError(409, {
      error: 'SubscriptionAlreadyActiveError',
      message: 'Usuário já possui uma assinatura ativa.' });

    expect(getApiErrorMessage(error, FALLBACK)).toBe('Usuário já possui uma assinatura ativa.');
  });

  it('hides the backend message for 5xx responses', () => {
    const error = createAxiosError(500, {
      message: 'No valid payment method types for this Checkout Session.',
    });

    expect(getApiErrorMessage(error, FALLBACK)).toBe(FALLBACK);
  });

  it('falls back for framework or gateway messages that are not domain errors', () => {
    const nestNotFound = createAxiosError(404, {
      error: 'Not Found',
      message: 'Cannot GET /galeries/x/y',
    });
    const kongNotFound = createAxiosError(404, { message: 'no Route matched with those values' });

    expect(getApiErrorMessage(nestNotFound, FALLBACK)).toBe(FALLBACK);
    expect(getApiErrorMessage(kongNotFound, FALLBACK)).toBe(FALLBACK);
  });

  it('falls back when the message is a validation array', () => {
    const error = createAxiosError(400, { message: ['plan must be one of the following values'] });

    expect(getApiErrorMessage(error, FALLBACK)).toBe(FALLBACK);
  });

  it('returns a session message for 401 responses', () => {
    expect(getApiErrorMessage(createAxiosError(401, { message: 'Unauthorized' }), FALLBACK)).toBe(
      'Sua sessão expirou. Entre novamente para continuar.',
    );
  });

  it('returns a connection message when there is no response', () => {
    expect(getApiErrorMessage({ isAxiosError: true }, FALLBACK)).toBe(
      'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
    );
  });

  it('falls back for non-axios errors', () => {
    expect(getApiErrorMessage(new Error('boom'), FALLBACK)).toBe(FALLBACK);
  });
});
