import { JwtAuthGuard, type SessionPayload, TokenPayload } from '@bookink/shared/auth';
import { Controller, Delete, Get, Post, Query, Redirect, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { GoogleCalendarService } from '@/infrastructure/google-calendar/google-calendar.service';

@ApiTags('google-calendar')
@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(private readonly calendar: GoogleCalendarService) {}

  @Get('callback')
  @Redirect()
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
  ) {
    const base = process.env.FRONTEND_URL ?? 'http://localhost:3000';

    try {
      if (error || !code || !state) throw new Error('Authorization failed');

      await this.calendar.completeAuthorization(code, state);

      return { url: `${base}/dashboard?calendar=connected` };
    } catch {
      return { url: `${base}/dashboard?calendar=error` };
    }
  }

  @Get('connect')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async connect(@TokenPayload() user: SessionPayload) {
    return { url: await this.calendar.startAuthorization(user.sub) };
  }

  @Get('status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  status(@TokenPayload() user: SessionPayload) {
    return this.calendar.status(user.sub);
  }

  @Delete('connection')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async disconnect(@TokenPayload() user: SessionPayload) {
    await this.calendar.disconnect(user.sub);
    return { connected: false };
  }

  @Post('retry-failed')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async retryFailed(@TokenPayload() user: SessionPayload) {
    return { retried: await this.calendar.retryFailed(user.sub) };
  }
}
