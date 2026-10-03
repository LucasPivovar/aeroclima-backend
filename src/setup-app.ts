import {
  type INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

export function setupApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const development = config.get<string>('NODE_ENV') !== 'production';
  app.use(
    helmet({
      // Localhost usa HTTP; mantenha CSP sem forçar HTTPS em desenvolvimento.
      contentSecurityPolicy: development
        ? { directives: { upgradeInsecureRequests: null } }
        : undefined,
      strictTransportSecurity: development ? false : undefined,
    }),
  );
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '/', method: RequestMethod.GET },
      { path: 'favicon.ico', method: RequestMethod.GET },
    ],
  });
  app.enableCors({ origin: config.getOrThrow<string>('CORS_ORIGIN') });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  if (config.get<string>('NODE_ENV') !== 'production') {
    const definition = new DocumentBuilder()
      .setTitle('AeroClima API')
      .setDescription('Base da API de planejamento de viagens.')
      .setVersion('1.0.0')
      .build();
    SwaggerModule.setup(
      'docs',
      app,
      SwaggerModule.createDocument(app, definition),
    );
  }
}
