import {
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CitySearchRequestDto {
  @ApiProperty({
    example: 'Gent',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  q!: string;
}

export class CityResponseDto {
  @ApiProperty({ example: 'Ghent' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 'Belgium' })
  @Expose()
  country!: string;

  @ApiProperty({ example: 51.0543 })
  @Expose()
  latitude!: number;

  @ApiProperty({ example: 3.7174 })
  @Expose()
  longitude!: number;
}

export class CityListResponseDto {
  @ApiProperty({ type: () => [CityResponseDto] })
  @Expose()
  items!: CityResponseDto[];
}