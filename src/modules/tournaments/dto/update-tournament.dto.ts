import { PartialType } from '@nestjs/mapped-types';
import { CreateTournamentDto } from './create-tournament.dto';
import { IsIn, IsOptional } from 'class-validator';

export class UpdateTournamentDto extends PartialType(CreateTournamentDto) {
  @IsOptional()
  @IsIn(['registration', 'ongoing', 'finished', 'cancelled'])
  status?: string;
}
