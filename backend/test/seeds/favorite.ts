import { DatabaseProvider } from '../../src/drizzle/drizzle.provider';
import { favorites } from '../../src/drizzle/schema';

export const FAVORITES_SEED = [
  {
    id: 1,
    cityName: 'Ghent',
    country: 'Belgium',
    latitude: 51.05,
    longitude: 3.71667,
  },
  {
    id: 2,
    cityName: 'Brussels',
    country: 'Belgium',
    latitude: 50.85045,
    longitude: 4.34878,
  },
];

export async function seedFavorites(drizzle: DatabaseProvider): Promise<void> {
  await drizzle.insert(favorites).values(FAVORITES_SEED);
}

export async function clearFavorites(drizzle: DatabaseProvider): Promise<void> {
  await drizzle.delete(favorites);
}
