import { validateEnvironment } from './environment.js';

const valid = {
  DB_HOST: 'localhost',
  DB_NAME: 'test',
  DB_USER: 'test',
  DB_PASSWORD: 'test',
};

describe('Configuração do ambiente', () => {
  it('converte portas e aplica os valores padrão', () => {
    expect(validateEnvironment({ ...valid, PORT: '4000' })).toMatchObject({
      PORT: 4000,
      DB_PORT: 5432,
    });
  });
  it.each(['abc', '0', '65536', '3.5'])('rejeita porta inválida %s', (port) => {
    expect(() => validateEnvironment({ ...valid, PORT: port })).toThrow('PORT');
  });
  it('exige credenciais sem incluir o valor no erro', () => {
    expect(() => validateEnvironment({ ...valid, DB_PASSWORD: '' })).toThrow(
      'DB_PASSWORD é obrigatório',
    );
  });
  it('rejeita CORS com caminho ou wildcard', () => {
    expect(() =>
      validateEnvironment({
        ...valid,
        CORS_ORIGIN: 'https://example.com/path',
      }),
    ).toThrow();
    expect(() => validateEnvironment({ ...valid, CORS_ORIGIN: '*' })).toThrow();
  });
});
