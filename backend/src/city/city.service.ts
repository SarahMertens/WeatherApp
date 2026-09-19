import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CityListResponseDto, CityResponseDto } from './city.dto';

interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoCity[];
}

interface OpenMeteoCity {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

@Injectable()
export class CityService {
  private readonly geocodingUrl =
    'https://geocoding-api.open-meteo.com/v1/search';

  async search(query: string): Promise<CityListResponseDto> {
    const params = new URLSearchParams({
      name: query,
      count: '10',
      language: 'en',
      format: 'json',
    });

    try {
      const response = await fetch(`${this.geocodingUrl}?${params}`);

      if (!response.ok) {
        throw new Error(
          `Open-Meteo returned status ${response.status}`,
        );
      }

      const data =
        (await response.json()) as OpenMeteoGeocodingResponse;

      const items: CityResponseDto[] = (data.results ?? []).map((city) => ({
        name: city.name,
        country: city.country ?? 'Unknown',
        latitude: city.latitude,
        longitude: city.longitude,
      }));

      return { items };
    } catch (error) {
      console.error('Open-Meteo geocoding error:', error);

      throw new ServiceUnavailableException(
        'City search is currently unavailable',
      );
    }
  }
}