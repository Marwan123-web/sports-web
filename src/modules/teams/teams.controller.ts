import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';

@ApiTags('Teams')
@Controller('api/teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team created successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateTeamDto, @Req() req: any) {
    return this.teamsService.create(dto, req.user['sub']);
  }

  @Get('tournament/:tournamentId')
  @ApiOperation({ summary: 'Get all teams in a tournament' })
  findByTournament(
    @Param('tournamentId') tournamentId: string,
    @Query() query: { q?: string },
  ) {
    return this.teamsService.findByTournament(tournamentId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get team by ID' })
  findOne(@Param('id') id: string, @Query() query: { q?: string }) {
    return this.teamsService.findOne(id, query);
  }
}
