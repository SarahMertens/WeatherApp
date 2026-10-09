import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { ServerConfig } from './config/configuration';

/**
 * Groups validation messages per property, so the client gets
 * `{ details: { body: { cityName: ['...'] } } }` instead of a flat list.
 */
function formatValidationErrors(errors: ValidationError[] = []) {
  const body: Record<string, string[]> = {};

  for (const error of errors) {
    body[error.property] = Object.values(error.constraints ?? {});
  }

  return new BadRequestException({ details: { body } });
}

/**
 * Everything the HTTP layer needs besides the modules themselves.
 * Used by both `main.ts` and the e2e tests, so the tests run against
 * exactly the same configuration as the real application.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService<ServerConfig, true>);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
      exceptionFactory: formatValidationErrors,
    }),
  );

  app.use(helmet());

  app.enableCors({
    origin: config.get('frontendUrl', { infer: true }),
  });
}
