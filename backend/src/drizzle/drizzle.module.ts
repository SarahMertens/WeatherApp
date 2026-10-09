import { Logger, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import path from 'node:path';
import {
  type DatabaseProvider,
  DrizzleAsyncProvider,
  drizzleProvider,
  InjectDrizzle,
} from './drizzle.provider';

@Module({
  providers: [...drizzleProvider],
  exports: [DrizzleAsyncProvider],
})
export class DrizzleModule implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(DrizzleModule.name);

  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  /**
   * Pending migrations are applied on startup, so a fresh database (local,
   * CI or a test container) is ready without a separate manual step.
   */
  async onModuleInit() {
    await migrate(this.db, {
      migrationsFolder: path.resolve('migrations'),
    });

    this.logger.log('Database migrations are up to date');
  }

  async onModuleDestroy() {
    await this.db.$client.end();
  }
}
