import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { AppController } from '../src/app.controller.js';
import { DatabaseService } from '../src/database/database.service.js';
import { setupApp } from '../src/setup-app.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const database = { checkConnection: vi.fn() };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [
            () => ({ CORS_ORIGIN: 'http://localhost:5173', NODE_ENV: 'test' }),
          ],
        }),
      ],
      controllers: [AppController],
      providers: [{ provide: DatabaseService, useValue: database }],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    database.checkConnection.mockReset();
    await app.init();
  });

  it('responde no prefixo versionado sem depender do banco', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({ status: 'ok', service: 'aeroclima-api' });
  });

  it('retorna sucesso quando o banco responde', async () => {
    database.checkConnection.mockResolvedValue(undefined);
    await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
    expect(database.checkConnection).toHaveBeenCalledOnce();
  });

  it('retorna 503 sem expor detalhes de conexão', async () => {
    database.checkConnection.mockRejectedValue(new Error('senha-secreta'));
    const response = await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(503);
    expect(response.text).not.toContain('senha-secreta');
  });

  it('publica o contrato OpenAPI com as rotas reais', async () => {
    const response = await request(app.getHttpServer())
      .get('/docs-json')
      .expect(200);
    expect(response.body.paths).toHaveProperty('/api/v1/health/ready');
  });

  afterEach(async () => {
    await app.close();
  });
});
