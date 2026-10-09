import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { WeatherRequestDto, WeatherResponseDto } from './weather.dto';
import { WeatherService } from './weather.service';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @ApiResponse({
    status: 200,
    description: 'Current weather conditions for the given coordinates',
    type: WeatherResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid latitude, longitude or unit',
  })
  @ApiResponse({
    status: 503,
    description: 'The external weather service is unavailable',
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
