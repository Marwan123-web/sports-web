import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Controller('api/tournaments/:tournamentId/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAll(@Param('tournamentId') tournamentId: string) {
    return this.teamsService.findAllByTournament(tournamentId);
  }

  
  @Post()
  create(
    @Param('tournamentId') tournamentId: string,
    @Body() dto: CreateTeamDto,
    @Req() req: any,
  ) {
    return this.teamsService.create(tournamentId, dto, req.user.id);
  }

  
  @Patch(':teamId')
  update(
    @Param('tournamentId') tournamentId: string,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
    @Req() req: any,
  ) {
    return this.teamsService.update(tournamentId, teamId, dto, req.user.id);
  }

  
  @Delete(':teamId')
  remove(
    @Param('tournamentId') tournamentId: string,
    @Param('teamId') teamId: string,
    @Req() req: any,
  ) {
    return this.teamsService.remove(tournamentId, teamId, req.user.id);
  }
}
