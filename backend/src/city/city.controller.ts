import { Controller, Get, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CityService } from './city.service';
import {
  CitySearchRequestDto,
  CityListResponseDto,
} from './city.dto';

@ApiTags('Cities')
@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @ApiResponse({
    status: 200,
    description: 'Steden gevonden op basis van zoekterm',
    type: CityListResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ongeldige zoekterm',
  })
  @ApiResponse({
    status: 503,
    description: 'Externe geocoding service niet beschikbaar',
  })
  @Get('search')
  async search(
    @Query() query: CitySearchRequestDto,
  ): Promise<CityListResponseDto> {
    return this.cityService.search(query.q);
  }
}