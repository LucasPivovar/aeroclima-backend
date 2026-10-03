import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { setupApp } from './setup-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  app.enableShutdownHooks();
  await app.listen(
    app.get(ConfigService).getOrThrow<number>('PORT'),
    '0.0.0.0',
  );
}
await bootstrap();
