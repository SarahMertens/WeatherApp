export interface DatabaseConfig {
  url: string;
}

export interface ServerConfig {
  env: string;
  port: number;
  frontendUrl: string;
  database: DatabaseConfig;
}

export default (): ServerConfig => {
  const databaseUrl = process.env.DATABASE_URL;

  // Fail fast with a readable message instead of a cryptic connection error.
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Copy backend/.env.example to backend/.env.',
    );
  }

  return {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    database: {
      url: databaseUrl,
    },
  };
};
