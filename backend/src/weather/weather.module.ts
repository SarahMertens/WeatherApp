import { Module } from '@nestjs/common';
import { OpenMeteoModule } from '../open-meteo/open-meteo.module';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';

@Module({
  imports: [OpenMeteoModule],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
