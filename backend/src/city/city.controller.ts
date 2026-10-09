import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CityListResponseDto, CitySearchRequestDto } from './city.dto';
import { CityService } from './city.service';

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @ApiResponse({
    status: 200,
    description: 'Cities matching the search term',
    type: CityListResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid search term' })
  @ApiResponse({
    status: 503,
    description: 'The external geocoding service is unavailable',
  })
  @Get('search')
  async search(
    @Query() query: CitySearchRequestDto,
  ): Promise<CityListResponseDto> {
    return this.cityService.search(query.q);
  }
}
