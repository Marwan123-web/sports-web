import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandingsService } from './standings.service';
import { StandingsController } from './standings.controller';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Match } from '../matches/entities/match.entity';
import { Team } from '../teams/entities/team.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tournament, Match, Team])],
  controllers: [StandingsController],
  providers: [StandingsService],
})
export class StandingsModule {}
