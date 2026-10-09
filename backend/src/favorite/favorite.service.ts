import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { asc, eq } from 'drizzle-orm';
import {
  type DatabaseProvider,
  InjectDrizzle,
} from '../drizzle/drizzle.provider';
import { favorites } from '../drizzle/schema';
import {
  CreateFavoriteRequestDto,
  FavoriteListResponseDto,
  FavoriteResponseDto,
} from './favorite.dto';

const NOT_FOUND_MESSAGE = 'No favorite exists with this id';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectDrizzle()
    private readonly db: DatabaseProvider,
  ) {}

  async getAll(): Promise<FavoriteListResponseDto> {
    const rows = await this.db.query.favorites.findMany({
      orderBy: asc(favorites.id),
    });

    return { items: rows.map((row) => this.toDto(row)) };
  }

  async getById(id: number): Promise<FavoriteResponseDto> {
    const favorite = await this.db.query.favorites.findFirst({
      where: eq(favorites.id, id),
    });

    if (!favorite) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }

    return this.toDto(favorite);
  }

  /**
   * A location can only be saved once. That rule lives in the database as a
   * unique index on (latitude, longitude); a violation is turned into a
   * 409 Conflict by `DrizzleQueryErrorFilter`.
   */
  async create(dto: CreateFavoriteRequestDto): Promise<FavoriteResponseDto> {
    const [result] = await this.db.insert(favorites).values(dto);

    return this.getById(result.insertId);
  }

  async deleteById(id: number): Promise<void> {
    const [result] = await this.db
      .delete(favorites)
      .where(eq(favorites.id, id));

    if (result.affectedRows === 0) {
      throw new NotFoundException(NOT_FOUND_MESSAGE);
    }
  }

  private toDto(row: typeof favorites.$inferSelect): FavoriteResponseDto {
    return plainToInstance(FavoriteResponseDto, row, {
      excludeExtraneousValues: true,
    });
  }
}
