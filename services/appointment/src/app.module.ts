import { MessagingModule } from '@bookink/shared/events';
import { CacheModule } from '@bookink/shared/cache';
import { MailModule } from '@bookink/shared/mail';
import { JwtAuthModule } from '@bookink/shared/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { FindArtistBookingRequestsUseCase } from '@/application/use-cases/booking-request/find-artist-booking-requests.use-case';
import { FindArtistBookingRequestUseCase } from '@/application/use-cases/booking-request/find-artist-booking-request.use-case';
import { ConfirmAppointmentPaymentUseCase } from '@/application/use-cases/appointment/confirm-appointment-payment.use-case';
import { ExpirePendingAppointmentUseCase } from '@/application/use-cases/appointment/expire-pending-appointment.use-case';
import { FindClientConversationUseCase } from '@/application/use-cases/booking-request/find-client-conversation.use-case';
import { CreatePublicAppointmentUseCase } from '@/application/use-cases/appointment/create-public-appointment.use-case';
import { CreateBookingRequestUseCase } from '@/application/use-cases/booking-request/create-booking-request.use-case';
import { CloseBookingRequestUseCase } from '@/application/use-cases/booking-request/close-booking-request.use-case';
import { FindDayAppointmentsUseCase } from '@/application/use-cases/appointment/find-day-appointments.use-case';
import { GetAppointmentStatsUseCase } from '@/application/use-cases/appointment/get-appointment-stats.use-case';
import { SendClientMessageUseCase } from '@/application/use-cases/booking-request/send-client-message.use-case';
import { SendArtistMessageUseCase } from '@/application/use-cases/booking-request/send-artist-message.use-case';
import { PrismaBookingRequestRepository } from './infrastructure/repository/prisma-booking-request.repository';
import { PublicBookingRequestController } from './presentation/controllers/public-booking-request.controller';
import { FindRemindersByUserUseCase } from '@/application/use-cases/reminder/find-reminders-by-user.use-case';
import { FindBlockedTimesUseCase } from '@/application/use-cases/appointment/find-blocked-times.use-case';
import { CancelAppointmentUseCase } from '@/application/use-cases/appointment/cancel-appointment.use-case';
import { FindReminderByIdUseCase } from '@/application/use-cases/reminder/find-reminder-by-id.use-case';
import { PrismaAppointmentRepository } from './infrastructure/repository/prisma-appointment.repository';
import { PublicAppointmentController } from './presentation/controllers/public-appointment.controller';
import { CreateReminderUseCase } from '@/application/use-cases/reminder/create-reminder.use-case';
import { UpdateReminderUseCase } from '@/application/use-cases/reminder/update-reminder.use-case';
import { DeleteReminderUseCase } from '@/application/use-cases/reminder/delete-reminder.use-case';
import { PrismaReminderRepository } from './infrastructure/repository/prisma-reminder.repository';
import { MailBookingRequestNotifier } from './infrastructure/mail/mail-booking-request-notifier';
import { BookingRequestController } from './presentation/controllers/booking-request.controller';
import { BOOKING_REQUEST_REPOSITORY } from './application/port/booking-request-repository.port';
import { BOOKING_REQUEST_NOTIFIER } from './application/port/booking-request-notifier.port';
import { PaymentEventsConsumer } from './infrastructure/messaging/payment-events.consumer';
import { MailAppointmentNotifier } from './infrastructure/mail/mail-appointment-notifier';
import { AppointmentController } from './presentation/controllers/appointment.controller';
import { APPOINTMENT_REPOSITORY } from './application/port/appointment-repository.port';
import { PaymentEventsHandler } from '@/application/handlers/payment-events.handler';
import { APPOINTMENT_NOTIFIER } from './application/port/appointment-notifier.port';
import { ReminderController } from './presentation/controllers/reminder.controller';
import { REMINDER_REPOSITORY } from './application/port/reminder-repository.port';
import { HealthController } from './presentation/controllers/health.controller';
import { HttpCatalogGateway } from './infrastructure/http/http-catalog.gateway';
import { HttpDepositGateway } from './infrastructure/http/http-deposit.gateway';
import { HttpArtistGateway } from './infrastructure/http/http-artist.gateway';
import { HmacBookingLink } from './infrastructure/crypto/hmac-booking-link';
import { CATALOG_GATEWAY } from './application/port/catalog-gateway.port';
import { DEPOSIT_GATEWAY } from './application/port/deposit-gateway.port';
import { ARTIST_GATEWAY } from './application/port/artist-gateway.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import servicesConfig from './infrastructure/config/services.config';
import { BOOKING_LINK } from './application/port/booking-link.port';
import { CreateBookingOfferUseCase } from '@/application/use-cases/booking-offer/create-booking-offer.use-case';
import { WithdrawBookingOfferUseCase } from '@/application/use-cases/booking-offer/withdraw-booking-offer.use-case';
import { PayBookingOfferUseCase } from '@/application/use-cases/booking-offer/pay-booking-offer.use-case';
import { PrismaBookingOfferRepository } from './infrastructure/repository/prisma-booking-offer.repository';
import { BOOKING_OFFER_REPOSITORY } from './application/port/booking-offer-repository.port';
import { DepositBookingService } from './application/services/deposit-booking.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [servicesConfig] }),
    JwtAuthModule,
    MessagingModule,
    CacheModule,
    MailModule,
  ],
  controllers: [
    ReminderController,
    AppointmentController,
    PublicAppointmentController,
    BookingRequestController,
    PublicBookingRequestController,
    HealthController,
  ],
  providers: [
    PrismaService,
    CreateReminderUseCase,
    FindReminderByIdUseCase,
    FindRemindersByUserUseCase,
    UpdateReminderUseCase,
    DeleteReminderUseCase,
    CreatePublicAppointmentUseCase,
    FindBlockedTimesUseCase,
    FindDayAppointmentsUseCase,
    GetAppointmentStatsUseCase,
    CancelAppointmentUseCase,
    ConfirmAppointmentPaymentUseCase,
    ExpirePendingAppointmentUseCase,
    PaymentEventsHandler,
    PaymentEventsConsumer,
    CreateBookingRequestUseCase,
    FindClientConversationUseCase,
    SendClientMessageUseCase,
    FindArtistBookingRequestsUseCase,
    FindArtistBookingRequestUseCase,
    SendArtistMessageUseCase,
    CloseBookingRequestUseCase,
    CreateBookingOfferUseCase,
    WithdrawBookingOfferUseCase,
    PayBookingOfferUseCase,
    DepositBookingService,
    {
      provide: BOOKING_OFFER_REPOSITORY,
      useClass: PrismaBookingOfferRepository,
    },
    {
      provide: BOOKING_REQUEST_REPOSITORY,
      useClass: PrismaBookingRequestRepository,
    },
    {
      provide: BOOKING_LINK,
      useClass: HmacBookingLink,
    },
    {
      provide: BOOKING_REQUEST_NOTIFIER,
      useClass: MailBookingRequestNotifier,
    },
    {
      provide: REMINDER_REPOSITORY,
      useClass: PrismaReminderRepository,
    },
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: PrismaAppointmentRepository,
    },
    {
      provide: ARTIST_GATEWAY,
      useClass: HttpArtistGateway,
    },
    {
      provide: CATALOG_GATEWAY,
      useClass: HttpCatalogGateway,
    },
    {
      provide: DEPOSIT_GATEWAY,
      useClass: HttpDepositGateway,
    },
    {
      provide: APPOINTMENT_NOTIFIER,
      useClass: MailAppointmentNotifier,
    },
  ],
})
export class AppModule {}
