import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Team } from '../teams/entities/team.entity';
import { UpdateResultDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
  ) {}

  // POST /api/tournaments/:id/matches/generate
  async generateForTournament(tournamentId: string, userId: number) {
    const tournament = await this.tournamentsRepo.findOne({
      where: { id: tournamentId },
      relations: ['creator', 'teams'],
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    if (tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the creator can generate matches');
    }

    const teams = tournament.teams;
    if (teams.length < 2) {
      throw new BadRequestException('Need at least 2 teams');
    }

    const existing = await this.matchesRepo.count({
      where: { tournament: { id: tournamentId } },
    });
    if (existing > 0) {
      throw new BadRequestException('Matches already generated');
    }

    const matches: Match[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const match = this.matchesRepo.create({
          tournament,
          homeTeam: teams[i],
          awayTeam: teams[j],
          status: 'upcoming',
          date: null,      // you can set dates later if you want
          fieldId: null,
        });
        matches.push(match);
      }
    }

    return this.matchesRepo.save(matches);
  }

  // GET /api/tournaments/:id/matches
  findByTournament(tournamentId: string) {
    return this.matchesRepo.find({
      where: { tournament: { id: tournamentId } },
      order: { date: 'ASC' },
    });
  }

  // GET /api/matches/:id
  async findOne(id: string) {
    const match = await this.matchesRepo.findOne({
      where: { id },
      relations: ['tournament', 'tournament.creator'],
    });
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  // PUT /api/matches/:id/result
  async updateResult(id: string, userId: number, dto: UpdateResultDto) {
    const match = await this.findOne(id);

    if (match.tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the creator can enter results');
    }

    if (!match.date || match.date > new Date()) {
      throw new BadRequestException('Cannot set result before match date');
    }

    match.homeScore = dto.homeScore;
    match.awayScore = dto.awayScore;
    match.status = 'played';

    return this.matchesRepo.save(match);
  }
}
