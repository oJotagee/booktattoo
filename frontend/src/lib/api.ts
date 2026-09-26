import axios from 'axios';

// Todas as chamadas passam pelo API gateway (Kong), que roteia para user,
// catalog e appointment pelo prefixo da rota.
export const api = axios.create({
  baseURL: process.env.API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});
