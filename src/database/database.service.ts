import {
  Inject,
  Injectable,
  type OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject(ConfigService) config: ConfigService) {
    this.pool = new Pool({
      host: config.getOrThrow<string>('DB_HOST'),
      port: config.getOrThrow<number>('DB_PORT'),
      database: config.getOrThrow<string>('DB_NAME'),
      user: config.getOrThrow<string>('DB_USER'),
      password: config.getOrThrow<string>('DB_PASSWORD'),
      max: 5,
      connectionTimeoutMillis: 2000,
      query_timeout: 2000,
      idleTimeoutMillis: 10000,
    });
    this.pool.on('error', () =>
      this.logger.warn('Conexão ociosa com banco interrompida.'),
    );
  }

  async checkConnection(): Promise<void> {
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
