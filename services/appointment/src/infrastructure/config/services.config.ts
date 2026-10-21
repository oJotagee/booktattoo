import { registerAs } from '@nestjs/config';

export default registerAs('services', () => ({
  userServiceUrl: process.env.USER_SERVICE_URL ?? 'http://localhost:8081',
  catalogServiceUrl: process.env.CATALOG_SERVICE_URL ?? 'http://localhost:8083',
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:8084',
  internalApiSecret: process.env.INTERNAL_API_SECRET ?? '',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  bookingLinkSecret: process.env.BOOKING_LINK_SECRET ?? '',
}));
