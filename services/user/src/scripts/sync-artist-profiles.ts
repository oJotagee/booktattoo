import 'reflect-metadata';

import { MessagingUnavailableError } from '@bookink/shared/events';
import { NestFactory } from '@nestjs/core';

import { RepublishArtistProfilesUseCase } from '@/application/use-cases/artist/republish-artist-profiles.use-case';
import { AppModule } from '../app.module';

const MAX_ATTEMPTS = 30;
const RETRY_DELAY_MS = 1000;

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const republish = app.get(RepublishArtistProfilesUseCase);

    for (let attempt = 1; ; attempt++) {
      try {
        const { published } = await republish.execute();
        console.log(`${published} perfis publicados em user.profile.updated`);
        return;
      } catch (error) {
        if (!(error instanceof MessagingUnavailableError) || attempt === MAX_ATTEMPTS) throw error;
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
