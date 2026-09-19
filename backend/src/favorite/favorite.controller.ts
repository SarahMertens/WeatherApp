import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiTags,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { FavoriteService } from './favorite.service';

import {
  FavoriteListResponseDto,
  FavoriteResponseDto,
  CreateFavoriteRequestDto,
} from './favorite.dto';

@ApiTags('Favorites')
@Controller('favorites')
export class FavoriteController {
  constructor(
    private readonly favoriteService: FavoriteService,
  ) {}

  @ApiResponse({
    status: 200,
    description: 'Alle favoriete steden',
    type: FavoriteListResponseDto,
  })
  @Get()
  async getAll(): Promise<FavoriteListResponseDto> {
    return this.favoriteService.getAll();
  }

  @ApiResponse({
    status: 200,
    description: 'Favoriete stad op ID',
    type: FavoriteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Favoriet niet gevonden',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FavoriteResponseDto> {
    return this.favoriteService.getById(id);
  }

  @ApiResponse({
    status: 201,
    description: 'Stad toegevoegd aan favorieten',
    type: FavoriteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Foute inputdata',
  })
  @ApiResponse({
    status: 409,
    description: 'Stad staat al bij favorieten',
  })
  @Post()
  async create(
    @Body() dto: CreateFavoriteRequestDto,
  ): Promise<FavoriteResponseDto> {
    return this.favoriteService.create(dto);
  }

  @ApiResponse({
    status: 204,
    description: 'Favoriet verwijderd',
  })
  @ApiResponse({
    status: 404,
    description: 'Favoriet niet gevonden',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    example: 1,
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.favoriteService.deleteById(id);
  }
}