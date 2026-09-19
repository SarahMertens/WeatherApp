import { IsString, IsNumber, MinLength, MaxLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FavoriteListResponseDto {
  @ApiProperty({ type: () => [FavoriteResponseDto] })
  @Expose()
  items!: FavoriteResponseDto[];
}

export class FavoriteResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'Ghent' })
  @Expose()
  cityName!: string;

  @ApiProperty({ example: 'Belgium' })
  @Expose()
  country!: string;

  @ApiProperty({ example: 51.0543 })
  @Expose()
  latitude!: number;

  @ApiProperty({ example: 3.7174 })
  @Expose()
  longitude!: number;

  @ApiProperty()
  @Expose()
  createdAt!: Date;
}

export class CreateFavoriteRequestDto {
  @ApiProperty({
    minLength: 1,
    maxLength: 100,
    example: 'Ghent',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  cityName!: string;

  @ApiProperty({
    minLength: 1,
    maxLength: 100,
    example: 'Belgium',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  country!: string;

  @ApiProperty({ example: 51.0543 })
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: 3.7174 })
  @IsNumber()
  longitude!: number;
}