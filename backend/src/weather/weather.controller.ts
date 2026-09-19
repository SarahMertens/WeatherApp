import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import {
  WeatherRequestDto,
  WeatherResponseDto,
} from './weather.dto';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Huidige weersomstandigheden',
    type: WeatherResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ongeldige latitude, longitude of unit',
  })
  @ApiResponse({
    status: 503,
    description: 'Weather service niet beschikbaar',
  })
  @Get()
  async getCurrentWeather(
    @Query() query: WeatherRequestDto,
  ): Promise<WeatherResponseDto> {
    return this.weatherService.getCurrentWeather(
      query.latitude,
      query.longitude,
      query.unit,
    );
  }
}