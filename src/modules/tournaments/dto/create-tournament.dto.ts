import {
    IsDateString,
    IsIn,
    IsInt,
    IsPositive,
    IsString,
  } from 'class-validator';
  import { SportType } from '../entities/tournament.entity';
  
  export class CreateTournamentDto {
    @IsString()
    name: string;
  
    @IsIn(['football', 'volleyball', 'basketball'])
    sport: SportType;
  
    @IsInt()
    @IsPositive()
    maxTeams: number;
  
    @IsDateString()
    startDate: string; // YYYY-MM-DD
  }
  