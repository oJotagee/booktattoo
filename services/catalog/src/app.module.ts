import { JwtAuthModule } from '@bookink/shared/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { UpdateServiceStatusUseCase } from '@/application/use-cases/service/update-service-status.use-case';
import { FindServicesByUserUseCase } from '@/application/use-cases/service/find-services-by-user.use-case';
import { UpdateServiceInfoUseCase } from '@/application/use-cases/service/update-service-info.use-case';
import { FindServiceByIdUseCase } from '@/application/use-cases/service/find-service-by-id.use-case';
import { PrismaServiceRepository } from './infrastructure/repository/prisma-service.repository';
import { CreateServiceUseCase } from '@/application/use-cases/service/create-service.use-case';
import { ServiceController } from './presentation/controllers/service.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { SERVICE_REPOSITORY } from './application/port/service-repository.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), JwtAuthModule],
  controllers: [ServiceController, HealthController],
  providers: [
    PrismaService,
    CreateServiceUseCase,
    FindServiceByIdUseCase,
    FindServicesByUserUseCase,
    UpdateServiceInfoUseCase,
    UpdateServiceStatusUseCase,
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceRepository,
    },
  ],
})
export class AppModule {}
