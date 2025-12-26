import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @ApiOperation({ summary: 'Add player to team' })
  @ApiResponse({ status: 201, description: 'Player created successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreatePlayerDto, @Req() req: any) {
    return this.playersService.create(dto, req.user['sub']);
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: 'Get all players in a team' })
  findByTeam(@Param('teamId') teamId: string) {
    return this.playersService.findByTeam(teamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get player by ID' })
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }
}
