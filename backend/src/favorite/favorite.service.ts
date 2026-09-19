import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';

import { favorites } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { plainToInstance } from 'class-transformer';

import {
  FavoriteListResponseDto,
  FavoriteResponseDto,
  CreateFavoriteRequestDto,
} from './favorite.dto';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  async getAll(): Promise<FavoriteListResponseDto> {
    const favoritesList = await this.db.query.favorites.findMany();

    const items = plainToInstance(
      FavoriteResponseDto,
      favoritesList,
      {
        excludeExtraneousValues: true,
      },
    );

    return { items };
  }

  async getById(id: number): Promise<FavoriteResponseDto> {
    const favorite = await this.db.query.favorites.findFirst({
      where: eq(favorites.id, id),
    });

    if (!favorite) {
      throw new NotFoundException(
        'Er bestaat geen favoriet met deze id',
      );
    }

    return plainToInstance(
      FavoriteResponseDto,
      favorite,
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async create(
    dto: CreateFavoriteRequestDto,
  ): Promise<FavoriteResponseDto> {
    const existingFavorite =
      await this.db.query.favorites.findFirst({
        where: and(
          eq(favorites.latitude, dto.latitude),
          eq(favorites.longitude, dto.longitude),
        ),
      });

    if (existingFavorite) {
      throw new ConflictException(
        'Deze stad staat al bij de favorieten',
      );
    }

    const [result] = await this.db
      .insert(favorites)
      .values(dto);

    return this.getById(result.insertId);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db
      .delete(favorites)
      .where(eq(favorites.id, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException(
        'Er bestaat geen favoriet met deze id',
      );
    }
  }
}