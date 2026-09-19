import {
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  TemperatureUnit,
  WeatherResponseDto,
} from './weather.dto';

interface OpenMeteoWeatherResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
}

interface WeatherInfo {
  condition: string;
  icon: string;
}

@Injectable()
export class WeatherService {
  private readonly weatherUrl =
    'https://api.open-meteo.com/v1/forecast';

  async getCurrentWeather(
    latitude: number,
    longitude: number,
    unit: TemperatureUnit,
  ): Promise<WeatherResponseDto> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m',
        'apparent_temperature',
        'relative_humidity_2m',
        'wind_speed_10m',
        'weather_code',
      ].join(','),
      temperature_unit: unit,
      wind_speed_unit: 'kmh',
    });

    try {
      const response = await fetch(
        `${this.weatherUrl}?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(
          `Open-Meteo returned status ${response.status}`,
        );
      }

      const data =
        (await response.json()) as OpenMeteoWeatherResponse;

      const weatherInfo = this.getWeatherInfo(
        data.current.weather_code,
      );

      return {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        condition: weatherInfo.condition,
        icon: weatherInfo.icon,
        temperatureUnit:
          unit === TemperatureUnit.FAHRENHEIT ? '°F' : '°C',
        windSpeedUnit: 'km/h',
      };
    } catch (error) {
      console.error('Open-Meteo weather error:', error);

      throw new ServiceUnavailableException(
        'Weather service is currently unavailable',
      );
    }
  }

  private getWeatherInfo(code: number): WeatherInfo {
    switch (code) {
      case 0:
        return { condition: 'Clear sky', icon: 'sun' };

      case 1:
        return { condition: 'Mainly clear', icon: 'cloud-sun' };

      case 2:
        return { condition: 'Partly cloudy', icon: 'cloud-sun' };

      case 3:
        return { condition: 'Overcast', icon: 'cloud' };

      case 45:
      case 48:
        return { condition: 'Fog', icon: 'cloud' };

      case 51:
      case 53:
      case 55:
        return { condition: 'Drizzle', icon: 'cloud-rain' };

      case 56:
      case 57:
        return {
          condition: 'Freezing drizzle',
          icon: 'cloud-rain',
        };

      case 61:
      case 63:
      case 65:
        return { condition: 'Rain', icon: 'cloud-rain' };

      case 66:
      case 67:
        return {
          condition: 'Freezing rain',
          icon: 'cloud-rain',
        };

      case 71:
      case 73:
      case 75:
      case 77:
        return { condition: 'Snow', icon: 'cloud-snow' };

      case 80:
      case 81:
      case 82:
        return {
          condition: 'Rain showers',
          icon: 'cloud-rain',
        };

      case 85:
      case 86:
        return {
          condition: 'Snow showers',
          icon: 'cloud-snow',
        };

      case 95:
      case 96:
      case 99:
        return {
          condition: 'Thunderstorm',
          icon: 'zap',
        };

      default:
        return { condition: 'Unknown', icon: 'cloud' };
    }
  }
}