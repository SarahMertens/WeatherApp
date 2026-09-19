import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

import {
  SwaggerModule,
  DocumentBuilder,
} from '@nestjs/swagger';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { DrizzleQueryErrorFilter } from './drizzle/drizzle-query-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Alle endpoints beginnen met /api
  app.setGlobalPrefix('api');

  // DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,

      exceptionFactory: (
        errors: ValidationError[] = [],
      ) => {
        const formattedErrors = errors.reduce(
          (acc, err) => {
            acc[err.property] = Object.values(
              err.constraints || {},
            );

            return acc;
          },
          {} as Record<string, string[]>,
        );

        return new BadRequestException({
          details: {
            body: formattedErrors,
          },
        });
      },
    }),
  );

  app.useGlobalFilters(
    new DrizzleQueryErrorFilter(),
  );

  // Security headers
  app.use(helmet());

  // React frontend toegang geven
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  });

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription(
      'Backend API for the DEV@WORK weather application',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);

  const port =
    configService.get<number>('port') || 3000;

  await app.listen(port);

  console.log(
    `Weather API running on http://localhost:${port}/api`,
  );

  console.log(
    `Swagger available on http://localhost:${port}/docs`,
  );
}

bootstrap();