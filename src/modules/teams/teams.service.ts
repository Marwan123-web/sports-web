import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { Tournament } from '../tournaments/entities/tournament.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
  ) {}

  async create(dto: CreateTeamDto, userId: number) {
    // ✅ Check tournament exists + registration open
    const tournament = await this.tournamentsRepo.findOne({
      where: {
        id: dto.tournamentId,
        status: 'registration',
        isActive: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException(
        'Tournament not found or registration closed',
      );
    }

    // ✅ Check maxTeams not reached
    const currentTeams = await this.teamsRepo.count({
      where: { tournament: { id: dto.tournamentId } },
    });

    if (currentTeams >= tournament.maxTeams) {
      throw new BadRequestException(
        `Tournament full (${currentTeams}/${tournament.maxTeams} teams)`,
      );
    }

    const team = this.teamsRepo.create({
      name: dto.name,
      tournament, // Link relation
    });

    const savedTeam = await this.teamsRepo.save(team);

    // ✅ Manually increment currentTeams
    tournament.currentTeams = currentTeams + 1;
    await this.tournamentsRepo.save(tournament);

    return savedTeam;
  }

  async findByTournament(tournamentId: string, query: { q?: string } = {}) {
    const { q } = query;

    return await this.teamsRepo.find({
      where: {
        tournament: { id: tournamentId },
        ...(q && { name: ILike(`%${q}%`) }),
        isActive: true,
      },
      order: { createdAt: 'ASC' },
      relations: ['tournament', 'players'],
    });
  }

  async findOne(id: string, query: { q?: string } = {}) {
    const { q } = query;

    const team = await this.teamsRepo.findOne({
      where: {
        id,
        isActive: true,
      },
      relations: ['tournament', 'players'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (q) {
      team.players = team.players.filter((player) =>
        player.name.toLowerCase().includes(q.toLowerCase()),
      );
    }

    return team;
  }
}
