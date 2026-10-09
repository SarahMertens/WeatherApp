import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { CityModule } from './city/city.module';
import configuration from './config/configuration';
import { DrizzleQueryErrorFilter } from './drizzle/drizzle-query-error.filter';
import { DrizzleModule } from './drizzle/drizzle.module';
import { FavoriteModule } from './favorite/favorite.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DrizzleModule,
    FavoriteModule,
    CityModule,
    WeatherModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DrizzleQueryErrorFilter,
    },
  ],
})
export class AppModule {}
