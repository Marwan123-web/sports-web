import { IsInt } from 'class-validator';

export class UpdateResultDto {
  @IsInt()
  homeScore: number;

  @IsInt()
  awayScore: number;
}
