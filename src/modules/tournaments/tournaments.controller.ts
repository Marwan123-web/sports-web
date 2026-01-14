import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomException } from 'src/common/exceptions/customException';
import { Protected } from 'src/common/decorators';

@ApiTags('tournaments')
@Controller('api/tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tournaments (searchable)' })
  @ApiResponse({ status: 200, description: 'List of tournaments' })
  findAll(@Query() query: { q?: string; sport?: string; status?: string }) {
    return this.tournamentsService.findAll(query);
  }

  @Get('my')
  @Protected()
  @ApiOperation({ summary: 'Get all tournaments (searchable)' })
  @ApiResponse({ status: 200, description: 'List of tournaments' })
  findMy(
    @Query() query: { q?: string; sport?: string; status?: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.tournamentsService.findMy(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tournament details' })
  @ApiResponse({ status: 200, description: 'Tournament details' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new tournament (requires auth)' })
  @ApiResponse({ status: 201, description: 'Tournament created' })
  create(@Body() dto: CreateTournamentDto, @Req() req: any) {
    return this.tournamentsService.create(dto, req.user.id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Update tournament (creator only)' })
  @ApiResponse({ status: 200, description: 'Tournament updated' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTournamentDto,
    @Req() req: any,
  ) {
    return this.tournamentsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tournament (creator only)' })
  @ApiResponse({ status: 204, description: 'Tournament deleted' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.tournamentsService.remove(id, req.user.id);
  }
}
