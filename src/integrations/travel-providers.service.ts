import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type Coordinates = { latitude: number; longitude: number };
export type PlaceCategory = 'tourism.sights' | 'accommodation.hotel';

// Clientes prontos para injetar nos futuros módulos; sem novas rotas públicas.
// Respostas externas permanecem unknown até cada módulo definir seu contrato.
@Injectable()
export class TravelProvidersService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  weather(point: Coordinates): Promise<unknown> {
    this.validatePoint(point);
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: String(point.latitude),
      longitude: String(point.longitude),
      current: 'temperature_2m,relative_humidity_2m,weather_code',
      daily:
        'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '7',
    }).toString();
    return this.request(url);
  }

  cities(query: string): Promise<unknown> {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({
      name: this.validateQuery(query),
      count: '10',
      language: 'pt',
      format: 'json',
    }).toString();
    return this.request(url);
  }

  addresses(query: string): Promise<unknown> {
    return this.geoapify('/v1/geocode/search', {
      text: this.validateQuery(query),
      lang: 'pt',
      limit: '10',
    });
  }

  places(point: Coordinates, category: PlaceCategory): Promise<unknown> {
    this.validatePoint(point);
    if (!['tourism.sights', 'accommodation.hotel'].includes(category)) {
      throw new BadRequestException('Categoria de lugar inválida.');
    }
    return this.geoapify('/v2/places', {
      categories: category,
      filter: `circle:${point.longitude},${point.latitude},5000`,
      bias: `proximity:${point.longitude},${point.latitude}`,
      limit: '20',
    });
  }

  route(from: Coordinates, to: Coordinates): Promise<unknown> {
    this.validatePoint(from);
    this.validatePoint(to);
    return this.geoapify('/v1/routing', {
      waypoints: `${from.latitude},${from.longitude}|${to.latitude},${to.longitude}`,
      mode: 'drive',
      lang: 'pt',
    });
  }

  private geoapify(path: string, params: Record<string, string>) {
    const key = this.config.get<string>('GEOAPIFY_API_KEY')?.trim();
    if (!key) {
      throw new ServiceUnavailableException(
        'Configure GEOAPIFY_API_KEY no .env para usar este serviço.',
      );
    }
    const url = new URL(path, 'https://api.geoapify.com');
    url.search = new URLSearchParams({ ...params, apiKey: key }).toString();
    return this.request(url);
  }

  private validatePoint(point: Coordinates) {
    if (
      !Number.isFinite(point.latitude) ||
      !Number.isFinite(point.longitude) ||
      Math.abs(point.latitude) > 90 ||
      Math.abs(point.longitude) > 180
    ) {
      throw new BadRequestException('Coordenadas inválidas.');
    }
  }

  private validateQuery(query: string) {
    const value = query.trim();
    if (value.length < 2 || value.length > 200) {
      throw new BadRequestException('Busca deve ter entre 2 e 200 caracteres.');
    }
    return value;
  }

  private async request(url: URL): Promise<unknown> {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Falha do fornecedor');
      return (await response.json()) as unknown;
    } catch {
      // Não retorna URL, chave, corpo externo ou detalhes internos ao cliente.
      throw new ServiceUnavailableException('Serviço externo indisponível.');
    }
  }
}
