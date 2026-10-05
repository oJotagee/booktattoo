import { StorageModule } from '@bookink/shared/storage';
import { JwtAuthModule } from '@bookink/shared/auth';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { UpdateServiceStatusUseCase } from '@/application/use-cases/service/update-service-status.use-case';
import { FindServicesByUserUseCase } from '@/application/use-cases/service/find-services-by-user.use-case';
import { FindGaleriesByUserUseCase } from '@/application/use-cases/galery/find-galeries-by-user.use-case';
import { UpdateServiceInfoUseCase } from '@/application/use-cases/service/update-service-info.use-case';
import { UpdateGaleryImageUseCase } from '@/application/use-cases/galery/update-galery-image.use-case';
import { FindServiceByIdUseCase } from '@/application/use-cases/service/find-service-by-id.use-case';
import { UpdateGaleryInfoUseCase } from '@/application/use-cases/galery/update-galery-info.use-case';
import { FindGaleryByIdUseCase } from '@/application/use-cases/galery/find-galery-by-id.use-case';
import { FindPublicServicesUseCase } from '@/application/use-cases/service/find-public-services.use-case';
import { FindPublicGaleriesUseCase } from '@/application/use-cases/galery/find-public-galeries.use-case';
import { PublicServiceController } from './presentation/controllers/public-service.controller';
import { PublicGaleryController } from './presentation/controllers/public-galery.controller';
import { PrismaServiceRepository } from './infrastructure/repository/prisma-service.repository';
import { CreateServiceUseCase } from '@/application/use-cases/service/create-service.use-case';
import { PrismaGaleryRepository } from './infrastructure/repository/prisma-galery.repository';
import { CreateGaleryUseCase } from '@/application/use-cases/galery/create-galery.use-case';
import { DeleteGaleryUseCase } from '@/application/use-cases/galery/delete-galery.use-case';
import { ServiceController } from './presentation/controllers/service.controller';
import { GaleryController } from './presentation/controllers/galery.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { SERVICE_REPOSITORY } from './application/port/service-repository.port';
import { GALERY_REPOSITORY } from './application/port/galery-repository.port';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { HttpPlanAccessGateway } from './infrastructure/http/http-plan-access.gateway';
import { PLAN_ACCESS_GATEWAY } from './application/port/plan-access-gateway.port';
import userServiceConfig from './infrastructure/config/user-service.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [userServiceConfig] }),
    JwtAuthModule,
    StorageModule,
  ],
  controllers: [
    ServiceController,
    GaleryController,
    PublicServiceController,
    PublicGaleryController,
    HealthController,
  ],
  providers: [
    PrismaService,
    CreateServiceUseCase,
    FindServiceByIdUseCase,
    FindServicesByUserUseCase,
    FindPublicServicesUseCase,
    UpdateServiceInfoUseCase,
    UpdateServiceStatusUseCase,
    CreateGaleryUseCase,
    FindGaleryByIdUseCase,
    FindGaleriesByUserUseCase,
    FindPublicGaleriesUseCase,
    UpdateGaleryInfoUseCase,
    UpdateGaleryImageUseCase,
    DeleteGaleryUseCase,
    {
      provide: SERVICE_REPOSITORY,
      useClass: PrismaServiceRepository,
    },
    {
      provide: GALERY_REPOSITORY,
      useClass: PrismaGaleryRepository,
    },
    {
      provide: PLAN_ACCESS_GATEWAY,
      useClass: HttpPlanAccessGateway,
    },
  ],
})
export class AppModule {}
