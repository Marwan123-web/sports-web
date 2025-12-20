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
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Controller('api/tournaments/:tournamentId/teams/:teamId/players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  findAll(@Param('teamId') teamId: string) {
    return this.playersService.findAllByTeam(teamId);
  }

  @Post()
  create(
    @Param('teamId') teamId: string,
    @Body() dto: CreatePlayerDto,
    @Req() req: any,
  ) {
    return this.playersService.create(teamId, req.user.id, dto);
  }

  @Patch(':playerId')
  update(
    @Param('teamId') teamId: string,
    @Param('playerId') playerId: string,
    @Body() dto: UpdatePlayerDto,
    @Req() req: any,
  ) {
    return this.playersService.update(teamId, playerId, req.user.id, dto);
  }

  
  @Delete(':playerId')
  remove(
    @Param('teamId') teamId: string,
    @Param('playerId') playerId: string,
    @Req() req: any,
  ) {
    return this.playersService.remove(teamId, playerId, req.user.id);
  }
}
