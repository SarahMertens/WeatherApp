import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OpenMeteoClient } from '../open-meteo/open-meteo.client';
import { CityListResponseDto } from './city.dto';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const MAX_RESULTS = 10;

interface OpenMeteoCity {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

interface OpenMeteoGeocodingResponse {
  // Open-Meteo leaves `results` out entirely when nothing matches.
  results?: OpenMeteoCity[];
}

@Injectable()
export class CityService {
  private readonly logger = new Logger(CityService.name);

  constructor(private readonly openMeteo: OpenMeteoClient) {}

  async search(query: string): Promise<CityListResponseDto> {
    try {
      const data = await this.openMeteo.get<OpenMeteoGeocodingResponse>(
        GEOCODING_URL,
        {
          name: query,
          count: String(MAX_RESULTS),
          language: 'en',
          format: 'json',
        },
      );

      const items = (data.results ?? []).map((city) => ({
        name: city.name,
        country: city.country ?? 'Unknown',
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      return { items };
    } catch (error) {
      this.logger.error('Open-Meteo geocoding request failed', error);

      throw new ServiceUnavailableException(
        'City search is currently unavailable',
      );
    }
  }
}
