import { ConfigService } from '@nestjs/config';
import { TravelProvidersService } from './travel-providers.service.js';

describe('Clientes de serviços externos', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('permite clima sem chave e usa coordenadas e timeout', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ current: { temperature_2m: 20 } }),
    } as Response);
    vi.stubGlobal('fetch', fetchMock);
    const service = new TravelProvidersService(new ConfigService());
    await expect(
      service.weather({ latitude: -25.43, longitude: -49.27 }),
    ).resolves.toEqual({ current: { temperature_2m: 20 } });
    const url = fetchMock.mock.calls[0]?.[0] as URL;
    expect(url.hostname).toBe('api.open-meteo.com');
    expect(url.searchParams.get('latitude')).toBe('-25.43');
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('não faz chamadas pagas sem chave configurada', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const service = new TravelProvidersService(new ConfigService());
    expect(() => service.addresses('Curitiba')).toThrow('GEOAPIFY_API_KEY');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('usa ordem latitude/longitude nas rotas e mantém a chave no backend', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue({
      ok: true,
      json: async () => ({ features: [] }),
    } as Response);
    vi.stubGlobal('fetch', fetchMock);
    const service = new TravelProvidersService(
      new ConfigService({ GEOAPIFY_API_KEY: 'test-key' }),
    );
    await service.route(
      { latitude: 10, longitude: 20 },
      { latitude: 30, longitude: 40 },
    );
    const url = fetchMock.mock.calls[0]?.[0] as URL;
    expect(url.searchParams.get('waypoints')).toBe('10,20|30,40');
    expect(url.searchParams.get('apiKey')).toBe('test-key');
  });

  it('rejeita coordenadas inválidas antes de chamar o fornecedor', () => {
    const service = new TravelProvidersService(new ConfigService());
    expect(() => service.weather({ latitude: 91, longitude: 0 })).toThrow(
      'Coordenadas inválidas',
    );
  });

  it('oculta segredos retornados em falhas do fornecedor', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new Error('test-key')),
    );
    const service = new TravelProvidersService(new ConfigService());
    await expect(service.cities('Curitiba')).rejects.toThrow(
      'Serviço externo indisponível.',
    );
  });
});
