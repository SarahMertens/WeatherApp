import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';

describe('Weather', () => {
  let app: INestApplication;
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy?.mockRestore();
  });

  afterAll(async () => {
    await app?.close();
  });

  const weatherPayload = (weatherCode = 2) => ({
    current: {
      temperature_2m: 18.6,
      apparent_temperature: 17.4,
      relative_humidity_2m: 72,
      wind_speed_10m: 13.4,
      weather_code: weatherCode,
    },
  });

  function mockWeather(weatherCode = 2) {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify(weatherPayload(weatherCode)), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
  }

  describe('GET /api/weather', () => {
    it('should return current weather in Celsius', async () => {
      mockWeather(2);

      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174, unit: 'celsius' });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        temperature: 19,
        feelsLike: 17,
        humidity: 72,
        windSpeed: 13.4,
        condition: 'Partly cloudy',
        icon: 'cloud-sun',
        temperatureUnit: '°C',
        windSpeedUnit: 'km/h',
      });
    });

    it('should return current weather in Fahrenheit', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            current: {
              temperature_2m: 65.7,
              apparent_temperature: 63.2,
              relative_humidity_2m: 72,
              wind_speed_10m: 13.4,
              weather_code: 0,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );

      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174, unit: 'fahrenheit' });

      expect(response.statusCode).toBe(200);
      expect(response.body.temperature).toBe(66);
      expect(response.body.feelsLike).toBe(63);
      expect(response.body.temperatureUnit).toBe('°F');
      expect(response.body.windSpeedUnit).toBe('km/h');
    });

    it('should default to Celsius when unit is omitted', async () => {
      mockWeather(0);

      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174 });

      expect(response.statusCode).toBe(200);
      expect(response.body.temperatureUnit).toBe('°C');
      expect(response.body.temperature).toBe(19);
    });

    it('should send the correct Open-Meteo parameters for Celsius', async () => {
      mockWeather();

      await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174, unit: 'celsius' });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const url = new URL(fetchSpy.mock.calls[0][0] as string);

      expect(url.origin + url.pathname).toBe(
        'https://api.open-meteo.com/v1/forecast',
      );
      expect(url.searchParams.get('latitude')).toBe('51.0543');
      expect(url.searchParams.get('longitude')).toBe('3.7174');
      expect(url.searchParams.get('temperature_unit')).toBe('celsius');
      expect(url.searchParams.get('wind_speed_unit')).toBe('kmh');
      expect(url.searchParams.get('current')).toBe(
        'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
      );
    });

    it('should send Fahrenheit to Open-Meteo when requested', async () => {
      mockWeather(0);

      await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174, unit: 'fahrenheit' });

      const url = new URL(fetchSpy.mock.calls[0][0] as string);
      expect(url.searchParams.get('temperature_unit')).toBe('fahrenheit');
    });

    it('should round temperature and feels-like values', async () => {
      mockWeather();

      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174 });

      expect(response.body.temperature).toBe(19);
      expect(response.body.feelsLike).toBe(17);
      expect(response.body.windSpeed).toBe(13.4);
    });

    it.each([
      [0, 'Clear sky', 'sun'],
      [1, 'Mainly clear', 'cloud-sun'],
      [2, 'Partly cloudy', 'cloud-sun'],
      [3, 'Overcast', 'cloud'],
      [45, 'Fog', 'cloud'],
      [48, 'Fog', 'cloud'],
      [51, 'Drizzle', 'cloud-rain'],
      [53, 'Drizzle', 'cloud-rain'],
      [55, 'Drizzle', 'cloud-rain'],
      [56, 'Freezing drizzle', 'cloud-rain'],
      [57, 'Freezing drizzle', 'cloud-rain'],
      [61, 'Rain', 'cloud-rain'],
      [63, 'Rain', 'cloud-rain'],
      [65, 'Rain', 'cloud-rain'],
      [66, 'Freezing rain', 'cloud-rain'],
      [67, 'Freezing rain', 'cloud-rain'],
      [71, 'Snow', 'cloud-snow'],
      [73, 'Snow', 'cloud-snow'],
      [75, 'Snow', 'cloud-snow'],
      [77, 'Snow', 'cloud-snow'],
      [80, 'Rain showers', 'cloud-rain'],
      [81, 'Rain showers', 'cloud-rain'],
      [82, 'Rain showers', 'cloud-rain'],
      [85, 'Snow showers', 'cloud-snow'],
      [86, 'Snow showers', 'cloud-snow'],
      [95, 'Thunderstorm', 'zap'],
      [96, 'Thunderstorm', 'zap'],
      [99, 'Thunderstorm', 'zap'],
      [999, 'Unknown', 'cloud'],
    ])(
      'should map weather code %i to %s / %s',
      async (code, condition, icon) => {
        mockWeather(code);

        const response = await request(app.getHttpServer())
          .get('/api/weather')
          .query({ latitude: 51.0543, longitude: 3.7174 });

        expect(response.statusCode).toBe(200);
        expect(response.body.condition).toBe(condition);
        expect(response.body.icon).toBe(icon);
      },
    );

    it('should return 400 when latitude is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ longitude: 3.7174 });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('latitude');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when longitude is missing', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543 });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('longitude');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when latitude is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 100, longitude: 3.7174 });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('latitude');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when longitude is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 200 });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('longitude');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should accept the minimum valid latitude and longitude', async () => {
      mockWeather(0);

      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: -90, longitude: -180 });

      expect(response.statusCode).toBe(200);
    });

    it('should accept the maximum valid latitude and longitude', async () => {
      mockWeather(0);

      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 90, longitude: 180 });

      expect(response.statusCode).toBe(200);
    });

    it('should return 400 when unit is invalid', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174, unit: 'kelvin' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('unit');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when latitude or longitude is not numeric', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 'abc', longitude: 'xyz' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('latitude');
      expect(response.body.details.body).toHaveProperty('longitude');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 for unexpected query parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174, extra: 'value' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('extra');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 503 when Open-Meteo is unavailable', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174 });

      expect(response.statusCode).toBe(503);
      expect(response.body.message).toBe(
        'Weather service is currently unavailable',
      );
    });

    it('should return 503 when Open-Meteo returns a non-2xx response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('Service unavailable', { status: 503 }),
      );

      const response = await request(app.getHttpServer())
        .get('/api/weather')
        .query({ latitude: 51.0543, longitude: 3.7174 });

      expect(response.statusCode).toBe(503);
      expect(response.body.message).toBe(
        'Weather service is currently unavailable',
      );
    });
  });
});
