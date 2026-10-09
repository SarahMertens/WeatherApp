import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './helpers/create-app';

describe('Cities', () => {
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

  describe('GET /api/cities/search', () => {
    it('should return 200 and matching cities', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                name: 'Ghent',
                country: 'Belgium',
                latitude: 51.05,
                longitude: 3.71667,
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );

      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'Ghent' });

      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual([
        {
          name: 'Ghent',
          country: 'Belgium',
          latitude: 51.05,
          longitude: 3.71667,
        },
      ]);
    });

    it('should return an empty array when Open-Meteo returns no results', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({}), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'Unknownville' });

      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual([]);
    });

    it('should use Unknown when a city has no country', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              {
                name: 'Test City',
                latitude: 10,
                longitude: 20,
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      );

      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'Test City' });

      expect(response.statusCode).toBe(200);
      expect(response.body.items[0].country).toBe('Unknown');
    });

    it('should request the correct Open-Meteo endpoint and parameters', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ results: [] }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

      await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'Ghent' });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const calledUrl = fetchSpy.mock.calls[0][0] as string;
      const url = new URL(calledUrl);

      expect(url.origin + url.pathname).toBe(
        'https://geocoding-api.open-meteo.com/v1/search',
      );
      expect(url.searchParams.get('name')).toBe('Ghent');
      expect(url.searchParams.get('count')).toBe('10');
      expect(url.searchParams.get('language')).toBe('en');
      expect(url.searchParams.get('format')).toBe('json');
    });

    it('should return 400 when q is missing', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/cities/search',
      );

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('q');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when q is shorter than 2 characters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'A' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('q');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when q is longer than 100 characters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'a'.repeat(101) });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('q');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 when q is not a string', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: ['Ghent', 'Brussels'] });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('q');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 400 for unexpected query parameters', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'Ghent', extra: 'value' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('extra');
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should return 503 when Open-Meteo is unavailable', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'Ghent' });

      expect(response.statusCode).toBe(503);
      expect(response.body.message).toBe(
        'City search is currently unavailable',
      );
    });

    it('should return 503 when Open-Meteo returns a non-2xx response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response('Service unavailable', { status: 503 }),
      );

      const response = await request(app.getHttpServer())
        .get('/api/cities/search')
        .query({ q: 'Ghent' });

      expect(response.statusCode).toBe(503);
      expect(response.body.message).toBe(
        'City search is currently unavailable',
      );
    });
  });
});
