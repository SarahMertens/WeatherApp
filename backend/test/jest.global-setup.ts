import { MySqlContainer } from '@testcontainers/mysql';
import type { StartedTestContainer } from 'testcontainers';

declare global {
  var mySQLContainer: StartedTestContainer;
}
export default async () => {
  console.log('🚢 Pulling and starting MySQL container');

  try {
    const container = await new MySqlContainer('mysql:8.0').start();
    process.env.DATABASE_URL = container.getConnectionUri();
    globalThis.mySQLContainer = container;

    console.log('✅ MySQL container started');
  } catch (error) {
    console.error('❌ Failed to setup database:', error);
    throw error;
  }
};
