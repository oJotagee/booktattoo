import 'reflect-metadata';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UnhandledExceptionFilter } from '@bookink/shared/http';

import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const port = process.env.PORT ?? '8084';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new UnhandledExceptionFilter(), new DomainExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Payment Service')
    .setDescription('API for billing and payments (Stripe)')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '::');

  console.log(`Payment service running on port ${port}`);

  console.log(
    `Application is running on: ${process.env.API_URL ?? `http://localhost:${port}`} \nSwagger is running on: ${process.env.API_URL ?? `http://localhost:${port}`}/api/docs`,
  );
}

bootstrap();
