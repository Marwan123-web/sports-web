import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchResultDto } from './dto/update-match.dto';

@ApiTags('Matches')
@Controller('api/matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Schedule new match' })
  @ApiResponse({ status: 201, description: 'Match scheduled successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateMatchDto, @Req() req: any) {
    return this.matchesService.create(dto, req.user.id);
  }

  @Patch(':id/result')
  @ApiOperation({ summary: 'Update match result' })
  @ApiResponse({ status: 200, description: 'Match result updated' })
  @UsePipes(new ValidationPipe({ transform: true }))
  updateResult(
    @Param('id') id: string,
    @Body() dto: UpdateMatchResultDto,
    @Req() req: any,
  ) {
    return this.matchesService.updateResult(id, dto, req.user.id);
  }

  @Get('tournament/:tournamentId')
  @ApiOperation({ summary: 'Get all matches in tournament' })
  findByTournament(@Param('tournamentId') tournamentId: string) {
    return this.matchesService.findByTournament(tournamentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get match by ID' })
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }
}
