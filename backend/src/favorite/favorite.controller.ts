import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateFavoriteRequestDto,
  FavoriteListResponseDto,
  FavoriteResponseDto,
} from './favorite.dto';
import { FavoriteService } from './favorite.service';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @ApiResponse({
    status: 200,
    description: 'All favorite cities',
    type: FavoriteListResponseDto,
  })
  @Get()
  async getAll(): Promise<FavoriteListResponseDto> {
    return this.favoriteService.getAll();
  }

  @ApiResponse({
    status: 200,
    description: 'The favorite city with the given id',
    type: FavoriteResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FavoriteResponseDto> {
    return this.favoriteService.getById(id);
  }

  @ApiResponse({
    status: 201,
    description: 'City added to the favorites',
    type: FavoriteResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({
    status: 409,
    description: 'This location is already a favorite',
  })
  @Post()
  async create(
    @Body() dto: CreateFavoriteRequestDto,
  ): Promise<FavoriteResponseDto> {
    return this.favoriteService.create(dto);
  }

  @ApiResponse({ status: 204, description: 'Favorite removed' })
  @ApiResponse({ status: 404, description: 'Favorite not found' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.favoriteService.deleteById(id);
  }
}
