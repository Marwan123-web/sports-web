import {
  IsDateString,
  IsInt,
  IsPositive,
  IsString,
  IsNotEmpty,
  Min,
  MaxDate,
  Matches,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTournamentDto {
  @ApiProperty({ example: 'Winter Football Cup 2025' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9\s\-&]+$/, {
    message: 'Name can only contain letters, numbers, spaces, -, &'
  })
  name: string;

  @ApiProperty({ enum: ['football', 'volleyball', 'basketball'] })
  @IsIn(['football', 'volleyball', 'basketball'])  // ✅ Works at runtime
  sport: string;

  @ApiProperty({ example: 16, minimum: 2, maximum: 64 })
  @IsInt()
  @Min(2)
  @IsPositive()
  maxTeams: number;

  @ApiProperty({ example: '2025-12-28' })
  @IsDateString()
  @MaxDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) // Max 1 year ahead
  startDate: string;

  @ApiProperty({ example: '2026-01-04' })
  @IsDateString()
  endDate: string;
}
