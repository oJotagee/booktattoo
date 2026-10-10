import { isAxiosError } from 'axios';

const MESSAGE_BY_STATUS: Record<number, string> = {
  401: 'Sua sessão expirou. Entre novamente para continuar.',
  413: 'O arquivo enviado é muito grande.',
  429: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
};

const NETWORK_ERROR_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  if (!error.response) return NETWORK_ERROR_MESSAGE;

  const { status, data } = error.response;

  if (MESSAGE_BY_STATUS[status]) return MESSAGE_BY_STATUS[status];
  if (status >= 500) return fallback;

  const body = data as { error?: unknown; message?: unknown } | undefined;
  const isDomainError = typeof body?.error === 'string' && body.error.endsWith('Error');

  return isDomainError && typeof body?.message === 'string' && body.message.trim()
    ? body.message
    : fallback;
}
