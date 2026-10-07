import axios, { type InternalAxiosRequestConfig } from 'axios';

// Todas as chamadas passam pelo API gateway (Kong), que roteia para user,
// catalog e appointment pelo prefixo da rota.
export const api = axios.create({
  baseURL: process.env.API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

const MAX_RETRIES = 2;

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config as (InternalAxiosRequestConfig & { retryCount?: number }) | undefined;
  const status = error.response?.status;
  const retryable = !status || status >= 500;

  if (!config || config.method !== 'get' || !retryable || (config.retryCount ?? 0) >= MAX_RETRIES) {
    throw error;
  }

  const attempt = (config.retryCount ?? 0) + 1;
  config.retryCount = attempt;
  await new Promise((resolve) => setTimeout(resolve, 500 * attempt));

  return api.request(config);
});
