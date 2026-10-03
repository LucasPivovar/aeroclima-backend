import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/environment.js';
import { DatabaseService } from './database/database.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
  ],
  controllers: [AppController],
  providers: [DatabaseService],
})
export class AppModule {}
