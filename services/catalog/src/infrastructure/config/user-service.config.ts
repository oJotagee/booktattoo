import { registerAs } from '@nestjs/config';

export default registerAs('userService', () => ({
  url: process.env.USER_SERVICE_URL ?? 'http://localhost:8081',
}));
