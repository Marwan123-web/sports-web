import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Tournament } from '../tournaments/entities/tournament.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
  ) {}

  async create(tournamentId: string, dto: CreateTeamDto, userId: number) {
    const tournament = await this.tournamentsRepo.findOne({
      where: { id: tournamentId },
      relations: ['creator', 'teams'],
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    if (tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the creator can add teams');
    }

    if (tournament.teams.length >= tournament.maxTeams) {
      throw new ForbiddenException('Maximum number of teams reached');
    }

    const team = this.teamsRepo.create({
      name: dto.name,
      tournament,
    });

    return this.teamsRepo.save(team);
  }

  async findAllByTournament(tournamentId: string) {
    return this.teamsRepo.find({
      where: { tournament: { id: tournamentId } },
      relations: ['players'],
    });
  }

  async update(
    tournamentId: string,
    teamId: string,
    dto: UpdateTeamDto,
    userId: number,
  ) {
    const team = await this.teamsRepo.findOne({
      where: { id: teamId },
      relations: ['tournament', 'tournament.creator'],
    });
    if (!team || team.tournament.id !== tournamentId) {
      throw new NotFoundException('Team not found');
    }
    if (team.tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the creator can edit teams');
    }

    Object.assign(team, dto);
    return this.teamsRepo.save(team);
  }

  async remove(tournamentId: string, teamId: string, userId: number) {
    const team = await this.teamsRepo.findOne({
      where: { id: teamId },
      relations: ['tournament', 'tournament.creator'],
    });
    if (!team || team.tournament.id !== tournamentId) {
      throw new NotFoundException('Team not found');
    }
    if (team.tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the creator can delete teams');
    }

    await this.teamsRepo.remove(team);
    return { deleted: true };
  }
}
