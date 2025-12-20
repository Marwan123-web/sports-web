import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { UpdateResultDto } from './dto/update-match.dto';

@Controller()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  // POST /api/tournaments/:id/matches/generate
  
  @Post('api/tournaments/:tournamentId/matches/generate')
  generate(
    @Param('tournamentId') tournamentId: string,
    @Req() req: any,
  ) {
    return this.matchesService.generateForTournament(
      tournamentId,
      req.user.id,
    );
  }

  // GET /api/tournaments/:id/matches
  @Get('api/tournaments/:tournamentId/matches')
  findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.matchesService.findByTournament(tournamentId);
  }

  // GET /api/matches/:id
  @Get('api/matches/:id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  // PUT /api/matches/:id/result
  
  @Put('api/matches/:id/result')
  updateResult(
    @Param('id') id: string,
    @Body() dto: UpdateResultDto,
    @Req() req: any,
  ) {
    return this.matchesService.updateResult(id, req.user.id, dto);
  }
}
