import axios from 'axios';

export const userServiceApi = axios.create({
  baseURL: process.env.USER_SERVICE_URL ?? 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
});

export type UserServiceSession = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};
