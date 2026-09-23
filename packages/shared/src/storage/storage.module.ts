import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { S3StorageAdapter } from './s3-storage.adapter';
import { STORAGE_PORT } from './storage.port';
import storageConfig from './storage.config';

/**
 * Módulo de storage compartilhado. Importar em qualquer serviço que precise
 * subir/ler arquivos do S3:
 *
 *   imports: [StorageModule]
 *
 * e injetar via `@Inject(STORAGE_PORT) private readonly storage: StoragePort`.
 */
@Module({
  imports: [ConfigModule.forFeature(storageConfig)],
  providers: [
    {
      provide: STORAGE_PORT,
      useClass: S3StorageAdapter,
    },
  ],
  exports: [STORAGE_PORT],
})
export class StorageModule {}
