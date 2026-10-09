import { IsEnum, IsLatitude, IsLongitude, IsOptional } from 'class-validator';
import { Type, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TemperatureUnit {
  CELSIUS = 'celsius',
  FAHRENHEIT = 'fahrenheit',
}

export class WeatherRequestDto {
  @ApiProperty({ example: 51.0543 })
  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @ApiProperty({ example: 3.7174 })
  @Type(() => Number)
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({
    enum: TemperatureUnit,
    default: TemperatureUnit.CELSIUS,
  })
  @IsOptional()
  @IsEnum(TemperatureUnit)
  unit: TemperatureUnit = TemperatureUnit.CELSIUS;
}

export class WeatherResponseDto {
  @ApiProperty({ example: 18 })
  @Expose()
  temperature!: number;

  @ApiProperty({ example: 17 })
  @Expose()
  feelsLike!: number;

  @ApiProperty({ example: 72 })
  @Expose()
  humidity!: number;

  @ApiProperty({ example: 13.4 })
  @Expose()
  windSpeed!: number;

  @ApiProperty({ example: 'Partly cloudy' })
  @Expose()
  condition!: string;

  @ApiProperty({ example: 'cloud-sun' })
  @Expose()
  icon!: string;

  @ApiProperty({ example: '°C' })
  @Expose()
  temperatureUnit!: string;

  @ApiProperty({ example: 'km/h' })
  @Expose()
  windSpeedUnit!: string;
}
