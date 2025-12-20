import { Controller, Get, Param } from '@nestjs/common';
import { StandingsService } from './standings.service';

@Controller('api/tournaments/:tournamentId/standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get()
  getStandings(@Param('tournamentId') tournamentId: string) {
    return this.standingsService.getStandings(tournamentId);
  }
}
