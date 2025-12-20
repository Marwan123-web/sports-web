import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Controller('api/tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  findAll(@Query('q') q?: string) {
    return this.tournamentsService.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  
  @Post()
  create(@Body() dto: CreateTournamentDto, @Req() req: any) {
    return this.tournamentsService.create(dto, req.user.id);
  }

  
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTournamentDto,
    @Req() req: any,
  ) {
    return this.tournamentsService.update(id, dto, req.user.id);
  }

  
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tournamentsService.remove(id, req.user.id);
  }
}
