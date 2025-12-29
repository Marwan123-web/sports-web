import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StandingsService, TeamStanding } from './standings.service';

@ApiTags('Standings')
@Controller('api/standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get('tournament/:tournamentId')
  @ApiOperation({ summary: 'Get tournament standings/leaderboard' })
  @ApiResponse({
    status: 200,
    description: 'Tournament standings',
    schema: {
      example: [
        {
          position: 1,
          team: { id: 'uuid', name: 'Real Madrid' },
          wins: 3,
          draws: 1,
          losses: 0,
          goalsFor: 10,
          goalsAgainst: 2,
          goalDifference: 8,
          points: 10,
        },
      ],
    },
  })
  async getTournamentStandings(
    @Param('tournamentId') tournamentId: string,
  ): Promise<TeamStanding[]> {
    return this.standingsService.getTournamentStandings(tournamentId);
  }
}
