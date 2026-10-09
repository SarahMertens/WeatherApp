import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { OpenMeteoClient } from '../open-meteo/open-meteo.client';
import { getWeatherInfo } from './weather-codes';
import { TemperatureUnit, WeatherResponseDto } from './weather.dto';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'wind_speed_10m',
  'weather_code',
];

interface OpenMeteoWeatherResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(private readonly openMeteo: OpenMeteoClient) {}

  async getCurrentWeather(
    latitude: number,
    longitude: number,
    unit: TemperatureUnit,
  ): Promise<WeatherResponseDto> {
    try {
      // Open-Meteo converts the temperature itself, so there is no
      // Celsius/Fahrenheit maths (and no rounding drift) on our side.
      const { current } = await this.openMeteo.get<OpenMeteoWeatherResponse>(
        FORECAST_URL,
        {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          current: CURRENT_FIELDS.join(','),
          temperature_unit: unit,
          wind_speed_unit: 'kmh',
        },
      );

      const { condition, icon } = getWeatherInfo(current.weather_code);

      return {
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        condition,
        icon,
        temperatureUnit: unit === TemperatureUnit.FAHRENHEIT ? '°F' : '°C',
        windSpeedUnit: 'km/h',
      };
    } catch (error) {
      this.logger.error('Open-Meteo forecast request failed', error);

      throw new ServiceUnavailableException(
        'Weather service is currently unavailable',
      );
    }
  }
}
