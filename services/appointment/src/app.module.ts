import { JwtAuthModule } from '@bookink/shared/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { FindRemindersByUserUseCase } from '@/application/use-cases/reminder/find-reminders-by-user.use-case';
import { FindReminderByIdUseCase } from '@/application/use-cases/reminder/find-reminder-by-id.use-case';
import { CreateReminderUseCase } from '@/application/use-cases/reminder/create-reminder.use-case';
import { UpdateReminderUseCase } from '@/application/use-cases/reminder/update-reminder.use-case';
import { DeleteReminderUseCase } from '@/application/use-cases/reminder/delete-reminder.use-case';
import { PrismaReminderRepository } from './infrastructure/repository/prisma-reminder.repository';
import { ReminderController } from './presentation/controllers/reminder.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { REMINDER_REPOSITORY } from './application/port/reminder-repository.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), JwtAuthModule],
  controllers: [ReminderController, HealthController],
  providers: [
    PrismaService,
    CreateReminderUseCase,
    FindReminderByIdUseCase,
    FindRemindersByUserUseCase,
    UpdateReminderUseCase,
    DeleteReminderUseCase,
    {
      provide: REMINDER_REPOSITORY,
      useClass: PrismaReminderRepository,
    },
  ],
})
export class AppModule {}
