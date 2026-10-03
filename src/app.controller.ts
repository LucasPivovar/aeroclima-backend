import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseService } from './database/database.service.js';

@ApiTags('Saúde')
@Controller('health')
export class AppController {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificar se a API está respondendo' })
  live() {
    return { status: 'ok', service: 'aeroclima-api' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Verificar conectividade com PostgreSQL' })
  @ApiResponse({ status: 200, description: 'API e banco disponíveis' })
  @ApiResponse({ status: 503, description: 'Banco indisponível' })
  async ready() {
    try {
      await this.database.checkConnection();
      return { status: 'ok', database: 'up' };
    } catch {
      throw new ServiceUnavailableException('Banco de dados indisponível.');
    }
  }
}
