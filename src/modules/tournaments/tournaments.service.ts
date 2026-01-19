import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ILike,
  Repository,
  LessThanOrEqual,
  MoreThanOrEqual,
  DeepPartial,
  DataSource,
  In,
} from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { User } from '../users/entities/user.entity';
import { Team } from '../teams/entities/team.entity';
import { Match } from '../matches/entities/match.entity';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Team) private readonly teamsRepo: Repository<Team>,
    @InjectRepository(Match) private readonly matchesRepo: Repository<Match>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateTournamentDto, creatorId: number) {
    // ✅ Validate creator exists
    const creator = await this.usersRepo.findOne({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException('Creator not found');

    const startDate = new Date(dto.startDate + 'T00:00:00');
    const endDate = new Date(dto.endDate + 'T00:00:00');

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const tournament = this.tournamentsRepo.create({
      ...dto,
      creator: { id: creatorId }, // ✅ Reference only!
      status: 'registration',
      currentTeams: 0,
      isActive: true,
    });

    return await this.tournamentsRepo.save(tournament); // ✅ Auto-links creator
  }

  findAll(
    query: {
      q?: string;
      sport?: string;
      status?: string;
      creatorId?: number;
    } = {},
  ) {
    const { q, sport, status, creatorId } = query;

    const baseWhere: any = { isActive: true };

    const dynamicFilters = {
      ...(sport && { sport }),
      ...(status && { status }),
      ...(q && { name: ILike(`%${q}%`) }),
      ...(creatorId && { creator: { id: creatorId } }), // Nested relation filter
    };

    const where =
      Object.keys(dynamicFilters).length > 0
        ? { ...baseWhere, ...dynamicFilters }
        : baseWhere;

    return this.tournamentsRepo.find({
      where,
      order: { startDate: 'ASC' },
      relations: ['creator'],
    });
  }

  findMy(
    query: { q?: string; sport?: string; status?: string } = {},
    userId: number,
  ) {
    return this.findAll({ ...query, creatorId: userId });
  }

  async findOne(id: string) {
    const tournament = await this.tournamentsRepo.findOne({
      where: { id, isActive: true },
      relations: ['creator', 'teams', 'matches'],
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  async update(id: string, dto: UpdateTournamentDto, userId: number) {
    const tournament = await this.findOne(id);

    if (tournament.creator!.id !== userId) {
      throw new ForbiddenException('Only the creator can edit');
    }

    if (dto.status === 'ongoing') {
      if (tournament.currentTeams != tournament.maxTeams) {
        throw new ForbiddenException('All teams must register first');
      }

      const teamCount = await this.teamsRepo.count({
        where: { tournament: { id } },
      });

      await this.generateRoundRobinSchedule(id, teamCount);
    }

    // ✅ Fix: Clear relations + no reload
    delete (tournament as any).matches;
    delete (tournament as any).teams;

    Object.assign(tournament, { ...dto, updatedAt: new Date() });
    return this.tournamentsRepo.save(tournament, { reload: false });
  }

  async remove(id: string, userId: number) {
    const tournament = await this.findOne(id);

    if (tournament.creator!.id !== userId) {
      throw new ForbiddenException(
        'Only the creator can delete this tournament',
      );
    }

    await this.tournamentsRepo.update(id, {
      isActive: false,
    });

    return { deleted: true };
  }

  async findUpcoming() {
    const now = new Date();
    return this.tournamentsRepo.find({
      where: {
        isActive: true,
        startDate: MoreThanOrEqual(now.toISOString().split('T')[0]),
      },
      order: { startDate: 'ASC' },
      relations: ['creator'],
      take: 10,
    });
  }

  async getStats(id: string) {
    const tournament = await this.findOne(id);
    return {
      totalTeams: tournament.teams?.length || 0,
      maxTeams: tournament.maxTeams,
      registrationOpen: tournament.status === 'registration',
      matchesCount: tournament.matches?.length || 0,
    };
  }

  async generateRoundRobinSchedule(
    tournamentId: string,
    teamCount: number,
  ): Promise<number> {
    const existingMatches = await this.matchesRepo.count({
      where: { tournamentId },
    });
    if (existingMatches > 0) return existingMatches;

    const teams = await this.teamsRepo.find({
      where: { tournamentId },
      order: { id: 'ASC' },
    });

    if (teams.length !== teamCount || teams.length < 2) {
      throw new BadRequestException(
        `Need ${teamCount} teams, got ${teams.length}`,
      );
    }

    const n = teams.length;
    const teamIds = teams.map((t) => t.id);
    let sql = `DELETE FROM "match" WHERE "tournamentId" = '${tournamentId}'; `;

    // ✅ Tomorrow 10:00 AM local time
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    startDate.setHours(10, 0, 0, 0);

    let currentDate = new Date(startDate);

    for (let r = 1; r <= n - 1; r++) {
      for (let i = 0; i < Math.floor(n / 2); i++) {
        const t1 = teamIds[i];
        const t2 = teamIds[n - 1 - i];

        const matchDate = new Date(currentDate);
        // ✅ PostgreSQL format: '2026-01-20 10:00:00'
        const dateStr = matchDate.toISOString().slice(0, 19).replace('T', ' ');

        sql += `INSERT INTO "match" ("tournamentId","team1Id","team2Id","round","status","scheduledAt") VALUES('${tournamentId}','${t1}','${t2}',${r},'scheduled','${dateStr}'); `;

        currentDate.setHours(currentDate.getHours() + 2);
      }

      const last = teamIds.pop()!;
      teamIds.splice(1, 0, last);
    }

    await this.dataSource.query(sql);
    return (n * (n - 1)) / 2;
  }
}
