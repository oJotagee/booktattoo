import axios, { type AxiosRequestConfig, isAxiosError } from 'axios';
import type { Logger } from '@nestjs/common';

import { ExternalServiceUnavailableError } from '@/domain/errors/appointment.error';

const REQUEST_TIMEOUT_MS = 5000;

export async function requestJson<T>(
  logger: Logger,
  config: AxiosRequestConfig,
): Promise<T | null> {
  const target = `${config.method?.toUpperCase() ?? 'GET'} ${config.url}`;

  try {
    const response = await axios.request<T>({ timeout: REQUEST_TIMEOUT_MS, ...config });

    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null;

    if (isAxiosError(error) && error.response) {
      const body = JSON.stringify(error.response.data ?? '');
      logger.error(`${target} respondeu ${error.response.status}: ${body.slice(0, 300)}`);
    } else {
      logger.error(`Falha ao chamar ${target}: ${(error as Error).message}`);
    }

    throw new ExternalServiceUnavailableError();
  }
}
