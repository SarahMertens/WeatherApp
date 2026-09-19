import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 5,
});

const db = drizzle(connection, {
  schema,
  mode: 'default',
});

async function resetDatabase() {
  console.log('🗑️ Resetting database...');

  await db.delete(schema.favorites);

  console.log('✅ Database reset completed\n');
}

async function seedFavorites() {
  console.log('📍 Seeding favorites...');

  await db.insert(schema.favorites).values([
    {
      cityName: 'Ghent',
      country: 'Belgium',
      latitude: 51.05,
      longitude: 3.71667,
    },
    {
      cityName: 'Brussels',
      country: 'Belgium',
      latitude: 50.85045,
      longitude: 4.34878,
    },
    {
      cityName: 'Antwerp',
      country: 'Belgium',
      latitude: 51.22047,
      longitude: 4.40026,
    },
  ]);

  console.log('✅ Favorites seeded successfully\n');
}

async function main() {
  console.log('🌱 Starting database seeding...\n');

  await resetDatabase();
  await seedFavorites();

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .then(async () => {
    await connection.end();
  })
  .catch(async (error) => {
    console.error('❌ Database seeding failed:', error);

    await connection.end();

    process.exit(1);
  });