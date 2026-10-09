import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { ServerConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Weather API')
    .setDescription(
      'Current weather, city search and favorite cities, backed by Open-Meteo.',
    )
    .setVersion('1.0')
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  const port = app
    .get(ConfigService<ServerConfig, true>)
    .get('port', { infer: true });

  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Weather API running on http://localhost:${port}/api`);
  logger.log(`Swagger available on http://localhost:${port}/docs`);
}

void bootstrap();
