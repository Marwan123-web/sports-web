import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UsePipes,
  ValidationPipe,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@ApiTags('Players')
@Controller('api/players')
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete player by ID' })
  @ApiResponse({ status: 200, description: 'Player deleted successfully' })
  @ApiResponse({ status: 404, description: 'Player not found' })
  @ApiResponse({ status: 403, description: 'Unauthorized to delete player' })
  async deletePlayer(@Param('id') id: string, @Req() req: any) {
    return this.playersService.delete(id);
  }
}
