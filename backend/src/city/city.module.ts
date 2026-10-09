import { Module } from '@nestjs/common';
import { OpenMeteoModule } from '../open-meteo/open-meteo.module';
import { CityController } from './city.controller';
import { CityService } from './city.service';

@Module({
  imports: [OpenMeteoModule],
  controllers: [CityController],
  providers: [CityService],
})
export class CityModule {}
