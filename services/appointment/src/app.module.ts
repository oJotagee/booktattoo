import { MessagingModule } from '@bookink/shared/events';
import { CacheModule } from '@bookink/shared/cache';
import { MailModule } from '@bookink/shared/mail';
import { JwtAuthModule } from '@bookink/shared/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { ConfirmAppointmentPaymentUseCase } from '@/application/use-cases/appointment/confirm-appointment-payment.use-case';
import { ExpirePendingAppointmentUseCase } from '@/application/use-cases/appointment/expire-pending-appointment.use-case';
import { CreatePublicAppointmentUseCase } from '@/application/use-cases/appointment/create-public-appointment.use-case';
import { FindDayAppointmentsUseCase } from '@/application/use-cases/appointment/find-day-appointments.use-case';
import { GetAppointmentStatsUseCase } from '@/application/use-cases/appointment/get-appointment-stats.use-case';
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
import { HttpDepositGateway } from './infrastructure/http/http-deposit.gateway';
import { PaymentEventsConsumer } from './infrastructure/messaging/payment-events.consumer';
import { DEPOSIT_GATEWAY } from './application/port/deposit-gateway.port';
import { AppointmentController } from './presentation/controllers/appointment.controller';
import { APPOINTMENT_REPOSITORY } from './application/port/appointment-repository.port';
import { PaymentEventsHandler } from '@/application/handlers/payment-events.handler';
import { ReminderController } from './presentation/controllers/reminder.controller';
import { REMINDER_REPOSITORY } from './application/port/reminder-repository.port';
import { HealthController } from './presentation/controllers/health.controller';
import { HttpCatalogGateway } from './infrastructure/http/http-catalog.gateway';
import { HttpArtistGateway } from './infrastructure/http/http-artist.gateway';
import { CATALOG_GATEWAY } from './application/port/catalog-gateway.port';
import { ARTIST_GATEWAY } from './application/port/artist-gateway.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import servicesConfig from './infrastructure/config/services.config';
import { MailAppointmentNotifier } from './infrastructure/mail/mail-appointment-notifier';
import { APPOINTMENT_NOTIFIER } from './application/port/appointment-notifier.port';

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
