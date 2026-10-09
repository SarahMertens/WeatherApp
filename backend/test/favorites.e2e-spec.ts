import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  DatabaseProvider,
  DrizzleAsyncProvider,
} from '../src/drizzle/drizzle.provider';
import { createTestApp } from './helpers/create-app';
import {
  FAVORITES_SEED,
  clearFavorites,
  seedFavorites,
} from './seeds/favorite';

describe('Favorites', () => {
  let app: INestApplication;
  let drizzle: DatabaseProvider;
  const url = '/api/favorites';

  beforeAll(async () => {
    app = await createTestApp();
    drizzle = app.get(DrizzleAsyncProvider);
  });

  beforeEach(async () => {
    await clearFavorites(drizzle);
    await seedFavorites(drizzle);
  });

  afterAll(async () => {
    await clearFavorites(drizzle);
    await app?.close();
  });

  describe('GET /api/favorites', () => {
    it('should return 200 and all favorites', async () => {
      const response = await request(app.getHttpServer()).get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items).toHaveLength(FAVORITES_SEED.length);
    });

    it('should return favorites with the correct structure', async () => {
      const response = await request(app.getHttpServer()).get(url);

      expect(response.statusCode).toBe(200);

      response.body.items.forEach((favorite: any) => {
        expect(favorite).toHaveProperty('id');
        expect(favorite).toHaveProperty('cityName');
        expect(favorite).toHaveProperty('country');
        expect(favorite).toHaveProperty('latitude');
        expect(favorite).toHaveProperty('longitude');
        expect(favorite).toHaveProperty('createdAt');

        expect(typeof favorite.id).toBe('number');
        expect(typeof favorite.cityName).toBe('string');
        expect(typeof favorite.country).toBe('string');
        expect(typeof favorite.latitude).toBe('number');
        expect(typeof favorite.longitude).toBe('number');
        expect(typeof favorite.createdAt).toBe('string');
      });
    });

    it('should return favorites in the order they were added', async () => {
      const response = await request(app.getHttpServer()).get(url);

      expect(
        response.body.items.map((favorite: { id: number }) => favorite.id),
      ).toEqual(FAVORITES_SEED.map((favorite) => favorite.id));
    });

    it('should return an empty array when no favorites exist', async () => {
      await clearFavorites(drizzle);

      const response = await request(app.getHttpServer()).get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual([]);
    });
  });

  describe('GET /api/favorites/:id', () => {
    it('should return 200 and the favorite by id', async () => {
      const response = await request(app.getHttpServer()).get(
        `${url}/${FAVORITES_SEED[0].id}`,
      );

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: FAVORITES_SEED[0].id,
          cityName: FAVORITES_SEED[0].cityName,
          country: FAVORITES_SEED[0].country,
          latitude: FAVORITES_SEED[0].latitude,
          longitude: FAVORITES_SEED[0].longitude,
        }),
      );
      expect(response.body.createdAt).toBeDefined();
    });

    it('should return 404 when the favorite does not exist', async () => {
      const response = await request(app.getHttpServer()).get(`${url}/9999`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No favorite exists with this id');
    });

    it('should return 400 when id is not a number', async () => {
      const response = await request(app.getHttpServer()).get(`${url}/abc`);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/favorites', () => {
    afterEach(async () => {
      await clearFavorites(drizzle);
      await seedFavorites(drizzle);
    });

    const newFavorite = {
      cityName: 'Antwerp',
      country: 'Belgium',
      latitude: 51.2194,
      longitude: 4.4025,
    };

    it('should return 201 and create a new favorite', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send(newFavorite);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          ...newFavorite,
        }),
      );
      expect(response.body.createdAt).toBeDefined();
    });

    it('should actually persist the new favorite', async () => {
      await request(app.getHttpServer()).post(url).send(newFavorite);

      const response = await request(app.getHttpServer()).get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual(
        expect.arrayContaining([expect.objectContaining(newFavorite)]),
      );
    });

    it('should return 409 when the same latitude and longitude already exist', async () => {
      const response = await request(app.getHttpServer()).post(url).send({
        cityName: 'Another Ghent Name',
        country: 'Belgium',
        latitude: FAVORITES_SEED[0].latitude,
        longitude: FAVORITES_SEED[0].longitude,
      });

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe(
        'This city is already in your favorites',
      );
    });

    it('should allow the same city name when the coordinates are different', async () => {
      const response = await request(app.getHttpServer()).post(url).send({
        cityName: 'Ghent',
        country: 'Belgium',
        latitude: 51.1,
        longitude: 3.8,
      });

      expect(response.statusCode).toBe(201);
    });

    it('should return 400 when cityName is missing', async () => {
      const { cityName, ...body } = newFavorite;
      void cityName;

      const response = await request(app.getHttpServer()).post(url).send(body);

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('cityName');
    });

    it('should return 400 when country is missing', async () => {
      const { country, ...body } = newFavorite;
      void country;

      const response = await request(app.getHttpServer()).post(url).send(body);

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('country');
    });

    it('should return 400 when latitude is missing', async () => {
      const { latitude, ...body } = newFavorite;
      void latitude;

      const response = await request(app.getHttpServer()).post(url).send(body);

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('latitude');
    });

    it('should return 400 when longitude is missing', async () => {
      const { longitude, ...body } = newFavorite;
      void longitude;

      const response = await request(app.getHttpServer()).post(url).send(body);

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('longitude');
    });

    it('should return 400 when cityName is empty', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, cityName: '' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('cityName');
    });

    it('should return 400 when country is empty', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, country: '' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('country');
    });

    it('should return 400 when cityName is longer than 100 characters', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, cityName: 'a'.repeat(101) });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('cityName');
    });

    it('should return 400 when country is longer than 100 characters', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, country: 'a'.repeat(101) });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('country');
    });

    it('should return 400 when cityName is not a string', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, cityName: 12345 });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('cityName');
    });

    it('should return 400 when country is not a string', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, country: 12345 });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('country');
    });

    it('should return 400 when latitude is not a number', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, latitude: 'abc' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('latitude');
    });

    it('should return 400 when longitude is not a number', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, longitude: 'abc' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('longitude');
    });

    it('should return 400 when latitude is out of range', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, latitude: 90.1 });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('latitude');
    });

    it('should return 400 when longitude is out of range', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, longitude: -180.1 });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('longitude');
    });

    it('should keep exactly one row when the same location is posted twice at once', async () => {
      const responses = await Promise.all([
        request(app.getHttpServer()).post(url).send(newFavorite),
        request(app.getHttpServer()).post(url).send(newFavorite),
      ]);

      expect(responses.map((r) => r.statusCode).sort()).toEqual([201, 409]);

      const list = await request(app.getHttpServer()).get(url);
      expect(list.body.items).toHaveLength(FAVORITES_SEED.length + 1);
    });

    it('should return 400 for unexpected body properties', async () => {
      const response = await request(app.getHttpServer())
        .post(url)
        .send({ ...newFavorite, extra: 'not allowed' });

      expect(response.statusCode).toBe(400);
      expect(response.body.details.body).toHaveProperty('extra');
    });
  });

  describe('DELETE /api/favorites/:id', () => {
    it('should return 204 and delete the favorite', async () => {
      const response = await request(app.getHttpServer()).delete(
        `${url}/${FAVORITES_SEED[0].id}`,
      );

      expect(response.statusCode).toBe(204);
      expect(response.text).toBe('');

      const getResponse = await request(app.getHttpServer()).get(
        `${url}/${FAVORITES_SEED[0].id}`,
      );

      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 when deleting a non-existing favorite', async () => {
      const response = await request(app.getHttpServer()).delete(`${url}/9999`);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('No favorite exists with this id');
    });

    it('should return 400 when delete id is not a number', async () => {
      const response = await request(app.getHttpServer()).delete(`${url}/abc`);

      expect(response.statusCode).toBe(400);
    });
  });
});
