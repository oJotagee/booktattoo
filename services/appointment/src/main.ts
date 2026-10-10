import 'reflect-metadata';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UnhandledExceptionFilter } from '@bookink/shared/http';

import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT ?? '8082';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new UnhandledExceptionFilter(), new DomainExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Appointment Service')
    .setDescription('API for managing appointments and reminders')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, '::');

  console.log(`Appointment service running on port ${port}`);

  console.log(
    `Application is running on: ${process.env.API_URL ?? `http://localhost:${port}`} \nSwagger is running on: ${process.env.API_URL ?? `http://localhost:${port}`}/api/docs`,
  );
}

bootstrap();
