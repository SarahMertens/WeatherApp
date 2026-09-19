import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';

import { DrizzleModule } from './drizzle/drizzle.module';

import { FavoriteModule } from './favorite/favorite.module';
import { CityModule } from './city/city.module';
import { WeatherModule } from './weather/weather.module';

import { AppController } from './app.controller';

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
})
export class AppModule {}