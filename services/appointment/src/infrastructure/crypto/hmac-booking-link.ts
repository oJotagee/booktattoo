import { createHmac, timingSafeEqual } from 'node:crypto';
import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';

import type { BookingLink } from '@/application/port/booking-link.port';
import servicesConfig from '../config/services.config';

export const MIN_BOOKING_LINK_SECRET_LENGTH = 32;

@Injectable()
export class HmacBookingLink implements BookingLink {
  private readonly secret: string;

  constructor(
    @Inject(servicesConfig.KEY)
    config: ConfigType<typeof servicesConfig>,
  ) {
    if (config.bookingLinkSecret.length < MIN_BOOKING_LINK_SECRET_LENGTH) {
      throw new Error(
        `BOOKING_LINK_SECRET precisa ter pelo menos ${MIN_BOOKING_LINK_SECRET_LENGTH} caracteres.`,
      );
    }

    this.secret = config.bookingLinkSecret;
  }

  sign(bookingRequestId: string): string {
    const payload = Buffer.from(bookingRequestId).toString('base64url');

    return `${payload}.${this.signature(payload).toString('base64url')}`;
  }

  verify(token: string): string | null {
    const [payload, signature, ...rest] = token.split('.');
    if (!payload || !signature || rest.length > 0) return null;

    const expected = this.signature(payload);
    const received = Buffer.from(signature, 'base64url');
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;

    return Buffer.from(payload, 'base64url').toString();
  }

  private signature(payload: string): Buffer {
    return createHmac('sha256', this.secret).update(payload).digest();
  }
}
